/*import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateUploadProductDto } from './dto/create-upload-product.dto';
import { UpdateUploadProductDto } from './dto/update-upload-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UploadProductsService {
  private readonly logger = new Logger('UploadProductsService');

  constructor(private readonly prisma: PrismaService) { }
  create(createUploadProductDto: CreateUploadProductDto[]) {
    try {
      return this.prisma.product.createMany({ data: createUploadProductDto });
    } catch (error) {
      this.logger.error('ERROR on UploadProductsService on function create', error);
      throw new InternalServerErrorException("Error on create function");
    }
  }

  updateDollarPrice() {

  }
}
*/

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadProductsService {
  private readonly logger = new Logger('UploadProductsService');

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Crea múltiples productos en lote a partir de una lista de productos importados
   * @param products Array de productos a crear
   * @param userId ID del usuario que realiza la importación
   */
  async createBulkProducts(products: any[], userId: string) {
    try {
      let insertedCount = 0;
      let errorCount = 0;

      // Obtener el inventario del usuario para todos los productos
      const userInventory = await this.prisma.inventory.findUnique({
        where: { userId }
      });

      if (!userInventory) {
        throw new BadRequestException('No se encontró el inventario del usuario');
      }

      // Procesar cada producto en transacciones individuales para evitar que un error en uno afecte a todos
      for (const productData of products) {
        try {
          await this.prisma.$transaction(async (tx) => {
            // Verificar si el producto ya existe (basado en nombre o ID adicional)
            const existingProduct = await tx.product.findFirst({
              where: {
                OR: [
                  { name: productData.name, userId },
                  { aditionalId: productData.aditionalId, userId, NOT: { aditionalId: null } }
                ]
              }
            });

            if (existingProduct) {
              // Actualizar producto existente
              await tx.product.update({
                where: { id: existingProduct.id },
                data: {
                  price: productData.price,
                  stock: {
                    increment: productData.stock // Añadir al stock existente
                  },
                  // Actualizar otros campos si es necesario
                  description: productData.description || existingProduct.description,
                  category: productData.category || existingProduct.category,
                  minimumStock: productData.minimumStock || existingProduct.minimumStock,
                  barcode: productData.barcode || existingProduct.barcode,
                  updatedAt: new Date()
                }
              });

              // Crear entrada en historial de precios si el precio cambió
              if (existingProduct.price !== productData.price) {
                await tx.priceProductHistory.create({
                  data: {
                    productId: existingProduct.id,
                    priceDollar: productData.priceDollar || 0,
                    priceBuyLocalCurrency: productData.priceBuyLocalCurrency || 0,
                    priceSaleLocalCurrency: productData.price,
                    reason: 'Actualización por importación masiva',
                    changedBy: userId
                  }
                });
              }

              // Crear entrada en inventario para el stock adicional
              await tx.inventoryEntry.create({
                data: {
                  inventoryId: userInventory.id,
                  productId: existingProduct.id,
                  quantity: productData.stock,
                  type: 'IMPORT',
                  cost: productData.priceBuyLocalCurrency,
                  notes: 'Actualización por importación masiva'
                }
              });
            } else {
              // Crear nuevo producto
              const newProduct = await tx.product.create({
                data: {
                  name: productData.name,
                  description: productData.description,
                  price: productData.price,
                  cost: productData.priceBuyLocalCurrency,
                  stock: productData.stock,
                  minimumStock: productData.minimumStock || 5,
                  barcode: productData.barcode,
                  category: productData.category,
                  userId: userId,
                  inventoryId: userInventory.id,
                  aditionalId: productData.aditionalId,
                  // Crear el primer registro de precio
                  priceHistory: {
                    create: {
                      priceDollar: productData.priceDollar || 0,
                      priceBuyLocalCurrency: productData.priceBuyLocalCurrency || 0,
                      priceSaleLocalCurrency: productData.price,
                      reason: 'Creación por importación masiva',
                      changedBy: userId
                    }
                  }
                }
              });

              // Crear entrada en el inventario para el stock inicial
              await tx.inventoryEntry.create({
                data: {
                  inventoryId: userInventory.id,
                  productId: newProduct.id,
                  quantity: productData.stock,
                  type: 'INITIAL',
                  cost: productData.priceBuyLocalCurrency,
                  notes: 'Stock inicial por importación masiva'
                }
              });
            }
          });

          insertedCount++;
        } catch (error) {
          this.logger.error(`Error al procesar producto "${productData.name}":`, error);
          errorCount++;
        }
      }

      return {
        insertedCount,
        errorCount,
        message: `Procesados ${insertedCount} productos con ${errorCount} errores.`
      };
    } catch (error) {
      this.logger.error('Error en la importación masiva de productos:', error);
      throw new BadRequestException(`Error en la importación: ${error.message}`);
    }
  }
}

// EJEMPLO DE DTO PARA LA CREACIÓN DE PRODUCTOS
export class CreateProductDto {
  name: string;
  description?: string;
  price: number;
  priceDollar?: number;
  priceBuyLocalCurrency?: number;
  initialStock?: number;
  stock: number;
  minimumStock?: number;
  barcode?: string;
  category?: string;
  imagePath?: string;
  aditionalId?: string;
}