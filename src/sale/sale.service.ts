import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleItemDto } from './dto/sale-item.dto';
import { SaleStatus } from '@prisma/client';


@Injectable()
export class SaleService {
  private logger = new Logger('Sale Service');

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Registrar una nueva venta con múltiples productos
   */
  async create(userId: string, createSaleDto: CreateSaleDto) {
    try {
      return this.prisma.$transaction(async (tx) => {
        // 1. Verificar que el medio de venta exista y pertenezca al usuario
        let saleMedia = await tx.saleMedia.findFirst({
          where: {
            id: createSaleDto.saleMediaId,
            userId
          }
        });

        if (!saleMedia) {
          saleMedia = await tx.saleMedia.create({
            data: {
              name: createSaleDto.saleMediaId,
              userId
            }
          });
        }

        // 2. Verificar que todos los productos existan y tengan stock suficiente
        for (const item of createSaleDto.items) {
          const product = await tx.product.findFirst({
            where: {
              id: item.productId,
              userId
            }
          });

          if (!product) {
            throw new NotFoundException(`Producto con ID ${item.productId} no encontrado`);
          }

          if (product.stock < item.quantity) {
            throw new BadRequestException(`Stock insuficiente para el producto ${product.name}. Disponible: ${product.stock}, Solicitado: ${item.quantity}`);
          }
        }

        // 3. Calcular totales
        let subtotal = 0;
        const saleItems: SaleItemDto[] = [];

        for (const item of createSaleDto.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId }
          });

          const unitPrice = item.customPrice || product.price;
          const itemTotal = unitPrice * item.quantity;

          subtotal += itemTotal;

          saleItems.push({
            ...item,
            unitPrice,
            total: itemTotal
          });
        }

        // Aplicar descuento si existe
        const discount = createSaleDto.discount || 0;

        // Aplicar impuesto si existe
        const tax = createSaleDto.tax || 0;

        // Calcular monto final
        const finalAmount = subtotal - discount + tax;

        // 4. Crear la venta
        const sale = await tx.sale.create({
          data: {
            reference: createSaleDto.reference,
            totalAmount: subtotal,
            discount,
            tax,
            finalAmount,
            status: createSaleDto.status as SaleStatus || 'PENDING',
            notes: createSaleDto.notes,
            saleMediaId: saleMedia.id,
            sellerId: userId,
            clientId: createSaleDto.clientId
          }
        });

        // 5. Crear los items de la venta y actualizar inventario
        for (const item of saleItems) {
          // Crear el ítem de venta
          await tx.saleItem.create({
            data: {
              saleId: sale.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              customPrice: item.customPrice,
              discount: item.discount,
              total: item.total,
              notes: item.notes
            }
          });

          // Obtener el producto para actualizar su inventario
          const product = await tx.product.findFirst({
            where: {
              id: item.productId,
              userId
            },
            include: {
              inventory: true
            }
          });

          // Registrar salida en inventario
          await tx.inventoryEntry.create({
            data: {
              inventoryId: product.inventoryId,
              productId: item.productId,
              quantity: -item.quantity, // Negativo porque es salida
              type: 'SALE',
              reference: `Venta #${sale.id}`,
              notes: `Venta por ${saleMedia.name}`
            }
          });

          // Actualizar stock del producto
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
        }

        // 6. Devolver la venta con sus items
        return tx.sale.findUnique({
          where: { id: sale.id },
          include: {
            items: true,
            saleMedia: true,
            client: true
          }
        });
      });
    } catch (error) {
      this.logger.error('ERROR on createSale function: ', error);
      throw new BadRequestException(`Error al crear la venta: ${error.message}`);
    }
  }

  /**
   * Obtener todas las ventas de un usuario
   */
  async findAll(userId: string) {
    try {
      return this.prisma.sale.findMany({
        where: {
          sellerId: userId
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imagePath: true
                }
              }
            }
          },
          saleMedia: true,
          client: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (error) {
      this.logger.error('ERROR on findAll sales function: ', error);
      throw new BadRequestException('Error al obtener las ventas');
    }
  }

  /**
   * Obtener detalle de una venta específica
   */
  async findOne(userId: string, saleId: string) {
    try {
      const sale = await this.prisma.sale.findFirst({
        where: {
          id: saleId,
          sellerId: userId
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          saleMedia: true,
          client: true,
          seller: true
        }
      });

      if (!sale) {
        throw new NotFoundException('Venta no encontrada');
      }

      return sale;
    } catch (error) {
      this.logger.error('ERROR on findOne sale function: ', error);
      throw new BadRequestException('Error al obtener la venta');
    }
  }

  /**
   * Actualizar estado de una venta
   */
  async updateStatus(userId: string, saleId: string, status: string) {
    try {
      const sale = await this.prisma.sale.findFirst({
        where: {
          id: saleId,
          sellerId: userId
        }
      });

      if (!sale) {
        throw new NotFoundException('Venta no encontrada');
      }

      return this.prisma.sale.update({
        where: { id: saleId },
        data: { status: status as SaleStatus }
      });
    } catch (error) {
      this.logger.error('ERROR on updateStatus function: ', error);
      throw new BadRequestException('Error al actualizar el estado de la venta');
    }
  }

  /**
   * Cancelar una venta y devolver productos al inventario
   */
  async cancel(userId: string, saleId: string, reason: string) {
    try {
      return this.prisma.$transaction(async (tx) => {
        // 1. Obtener la venta con sus items
        const sale = await tx.sale.findFirst({
          where: {
            id: saleId,
            sellerId: userId
          },
          include: {
            items: true
          }
        });

        if (!sale) {
          throw new NotFoundException('Venta no encontrada');
        }

        if (sale.status === 'CANCELLED') {
          throw new BadRequestException('La venta ya está cancelada');
        }

        // 2. Para cada item, devolver al inventario
        for (const item of sale.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            include: { inventory: true }
          });

          // Registrar devolución en inventario
          await tx.inventoryEntry.create({
            data: {
              inventoryId: product.inventoryId,
              productId: item.productId,
              quantity: item.quantity, // Positivo porque es devolución
              type: 'RETURN',
              reference: `Cancelación venta #${sale.id}`,
              notes: reason
            }
          });

          // Actualizar stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity
              }
            }
          });
        }

        // 3. Actualizar estado de la venta
        return tx.sale.update({
          where: { id: saleId },
          data: {
            status: 'CANCELLED',
            notes: sale.notes
              ? `${sale.notes}\nCancelado: ${reason}`
              : `Cancelado: ${reason}`
          }
        });
      });
    } catch (error) {
      this.logger.error('ERROR on cancelSale function: ', error);
      throw new BadRequestException(`Error al cancelar la venta: ${error.message}`);
    }
  }
}