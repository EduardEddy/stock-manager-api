import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  private logger = new Logger('Product Service');

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Crear un nuevo producto con stock inicial
   */
  async create(createProductDto: CreateProductDto, userId: string) {
    try {
      return this.prisma.$transaction(async (tx) => {
        // 1. Obtener el inventario del usuario
        const userInventory = await tx.inventory.findUnique({
          where: { userId }
        });

        if (!userInventory) {
          throw new NotFoundException('Inventario no encontrado');
        }

        // 2. Crear el producto con referencia al inventario
        const product = await tx.product.create({
          data: {
            name: createProductDto.name,
            description: createProductDto.description,
            price: createProductDto.price,
            cost: createProductDto.priceBuyLocalCurrency,
            stock: createProductDto.initialStock || 0,
            minimumStock: createProductDto.minimumStock || 5,
            barcode: createProductDto.barcode,
            category: createProductDto.category,
            imagePath: createProductDto.imagePath,
            userId: userId,
            inventoryId: userInventory.id,
            aditionalId: createProductDto.aditionalId,
            // Crear el primer registro de precio
            priceHistory: {
              create: {
                priceDollar: createProductDto.priceDollar || 0,
                priceBuyLocalCurrency: createProductDto.priceBuyLocalCurrency || 0,
                priceSaleLocalCurrency: createProductDto.price,
                reason: 'Creación inicial del producto'
              }
            }
          }
        });

        // 3. Si hay stock inicial, crear una entrada en el inventario
        if (createProductDto.initialStock && createProductDto.initialStock > 0) {
          await tx.inventoryEntry.create({
            data: {
              inventoryId: userInventory.id,
              productId: product.id,
              quantity: createProductDto.initialStock,
              type: 'INITIAL',
              cost: createProductDto.cost,
              notes: 'Stock inicial al crear el producto'
            }
          });
        }

        return product;
      });
    } catch (error) {
      this.logger.error('ERROR on create product function: ', error);
      throw new BadRequestException('Error al crear el producto');
    }
  }

  /**
   * Obtener todos los productos activos de un usuario
   */
  async findAll(userId: string) {
    try {
      return this.prisma.product.findMany({
        where: {
          userId,
          active: true
        },
        include: {
          inventory: {
            select: {
              id: true,
              name: true
            }
          },
          priceHistory: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        }
      });
    } catch (error) {
      this.logger.error('ERROR on findAll products function: ', error);
      throw new BadRequestException('Error al buscar productos');
    }
  }


  /**
   * TODO: Implementar la función para actualizar el stock de un producto y guardar historial
   */
  /**
   * Actualizar el stock de un producto (incremento o decremento)
   */
  async updateStock(userId: string, productId: string, quantity: number, type: string, reference?: string, notes?: string) {
    try {
      return this.prisma.$transaction(async (tx) => {
        // Verificar que el producto existe y pertenece al usuario
        const product = await tx.product.findFirst({
          where: {
            id: productId,
            userId
          },
          include: {
            inventory: true
          }
        });

        if (!product) {
          throw new NotFoundException('Producto no encontrado');
        }

        // Crear entrada en el inventario
        await tx.inventoryEntry.create({
          data: {
            inventoryId: product.inventoryId,
            productId: product.id,
            quantity: quantity, // Puede ser positivo (ingreso) o negativo (salida)
            type: 'New Sale',
            reference,
            notes
          }
        });

        // Actualizar el stock del producto
        return tx.product.update({
          where: { id: productId },
          data: {
            stock: {
              increment: quantity // Incrementa o decrementa según el signo de quantity
            }
          }
        });
      });
    } catch (error) {
      this.logger.error('ERROR on updateStock function: ', error);
      throw new BadRequestException('Error al actualizar el stock');
    }
  }

  /**
   * Actualizar el precio de un producto y guardar historial
   */
  async updatePrice(userId: string, productId: string, newPriceData: {
    price?: number,
    priceDollar?: number,
    costPrice?: number
  }, reason: string) {
    try {
      return this.prisma.$transaction(async (tx) => {
        // Verificar que el producto existe y pertenece al usuario
        const product = await tx.product.findFirst({
          where: {
            id: productId,
            userId
          }
        });

        if (!product) {
          throw new NotFoundException('Producto no encontrado');
        }

        // Datos para actualizar
        const updateData: any = {};

        if (newPriceData.price !== undefined) {
          updateData.price = newPriceData.price;
        }

        if (newPriceData.costPrice !== undefined) {
          updateData.cost = newPriceData.costPrice;
        }

        // Crear entrada en el historial de precios
        await tx.priceProductHistory.create({
          data: {
            productId: product.id,
            priceDollar: newPriceData.priceDollar || product.price / 60, // Ejemplo de conversión
            priceBuyLocalCurrency: newPriceData.costPrice || product.cost || 0,
            priceSaleLocalCurrency: newPriceData.price || product.price,
            reason: reason,
            changedBy: userId
          }
        });

        // Actualizar el precio del producto
        return tx.product.update({
          where: { id: productId },
          data: updateData
        });
      });
    } catch (error) {
      this.logger.error('ERROR on updatePrice function: ', error);
      throw new BadRequestException('Error al actualizar el precio');
    }
  }
}