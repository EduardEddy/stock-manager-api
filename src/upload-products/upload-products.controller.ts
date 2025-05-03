/*import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Req, Logger } from '@nestjs/common';
import { UploadProductsService } from './upload-products.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as XLSX from 'xlsx';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorators';
import * as multer from 'multer';
import { handleGetDollarPrice } from 'src/utils/get-dolla-price';

interface DataInterface {
  precio: number,
  stock: number,
  nombre: string,
  adicional_id: string,
  priceDollar: number,
  priceSaleLocalCurrency: number,
}

@Controller('upload-products')
@UseGuards(AuthGuard())
export class UploadProductsController {
  constructor(private readonly uploadProductsService: UploadProductsService) { }
  private readonly logger = new Logger('UploadProductsController');

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadFile(@UploadedFile() file, @GetUser() user, @Req() req: Request) {

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    const records = [];
    const dolarPrice = await handleGetDollarPrice();

    data.map((element: DataInterface) => {
      const { nombre, precio, stock, adicional_id } = element;
      records.push({
        name: nombre,
        price: precio,
        stock: stock,
        userId: user.id,
        aditionalId: adicional_id,
        priceDollar: dolarPrice,
        priceSaleLocalCurrency: 0
      })
    })

    return this.uploadProductsService.create(records);
  }
}
*/

import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Logger,
  BadRequestException,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { UploadProductsService } from './upload-products.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as XLSX from 'xlsx';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorators';
import * as multer from 'multer';
import { handleGetDollarPrice } from 'src/utils/get-dolla-price';
import { User } from '@prisma/client';

// Interfaz mejorada para el formato de los datos del Excel
interface ProductImportData {
  nombre: string;
  precio: number;
  stock: number;
  adicional_id?: string;
  precioCompra?: number;
  descripcion?: string;
  categoria?: string;
  stockMinimo?: number;
  codigoBarras?: string;
}

@Controller('upload-products')
@UseGuards(AuthGuard())
export class UploadProductsController {
  constructor(private readonly uploadProductsService: UploadProductsService) { }
  private readonly logger = new Logger('UploadProductsController');

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // Limitar a 10MB
      },
      fileFilter: (req, file, callback) => {
        // Validar tipo de archivo
        const allowedMimeTypes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException('Formato de archivo no válido. Solo se permiten archivos Excel (.xlsx, .xls)'),
            false
          );
        }
      },
    })
  )
  async uploadFile(@UploadedFile() file, @GetUser() user: User) {
    if (!file) {
      throw new BadRequestException('No se ha subido ningún archivo');
    }

    try {
      // Leer el archivo Excel
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });

      // Verificar que contenga al menos una hoja
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new BadRequestException('El archivo Excel no contiene hojas');
      }

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // Convertir a JSON y validar estructura
      const rawData = XLSX.utils.sheet_to_json(worksheet);

      if (!rawData || rawData.length === 0) {
        throw new BadRequestException('El archivo Excel está vacío o no tiene el formato correcto');
      }

      // Validar campos requeridos en el primer registro
      const firstRow = rawData[0];
      const requiredFields = ['nombre', 'precio', 'stock'];
      for (const field of requiredFields) {
        this.logger.log(field);
        if (!firstRow || typeof firstRow !== 'object' || !(field in firstRow)) {
          throw new BadRequestException(`El archivo no contiene la columna obligatoria "${field}"`);
        }
      }

      // Obtener tasa de dólar actual
      const dollarPrice = await handleGetDollarPrice();
      this.logger.log(`Tasa de dólar obtenida: ${dollarPrice}`);

      // Estadísticas para el registro
      let validRecords = 0;
      let invalidRecords = 0;

      // Procesar y validar cada registro
      const processedProducts = rawData.map((row: any, index: number) => {
        try {
          // Validar campos obligatorios
          if (!row.nombre || row.nombre.trim() === '') {
            this.logger.warn(`Fila ${index + 2}: Nombre de producto vacío`);
            invalidRecords++;
            return null;
          }

          // Convertir precio y stock a números y validar
          const price = Number(row.precio);
          const stock = Number(row.stock);
          const aditionalId = row?.idAdicional;

          if (isNaN(price) || price <= 0) {
            this.logger.warn(`Fila ${index + 2}: Precio inválido para "${row.nombre}"`);
            invalidRecords++;
            return null;
          }

          if (isNaN(stock) || stock < 0) {
            this.logger.warn(`Fila ${index + 2}: Stock inválido para "${row.nombre}"`);
            invalidRecords++;
            return null;
          }

          // Crear objeto de producto válido
          validRecords++;
          return {
            name: row.nombre.trim(),
            price: price,
            initialStock: stock,
            stock: stock, // Necesario para el modelo de datos
            userId: user.id,
            aditionalId,
            priceDollar: row.precioDolar || price / dollarPrice,
            priceBuyLocalCurrency: row.precioCompra || price * 0.7, // 70% del precio de venta como costo predeterminado
            description: row.descripcion || null,
            category: row.categoria || null,
            minimumStock: row.stockMinimo || 5,
            barcode: row.codigoBarras || null
          };
        } catch (error) {
          this.logger.error(`Error procesando fila ${index + 2}:`, error);
          invalidRecords++;
          return null;
        }
      }).filter(product => product !== null);

      // Si no hay registros válidos, devolver error
      if (processedProducts.length === 0) {
        throw new BadRequestException('No se encontraron registros válidos en el archivo');
      }

      // Enviar los productos al servicio para su creación
      const result = await this.uploadProductsService.createBulkProducts(processedProducts, user.id);

      // Retornar respuesta con información de la importación
      return {
        success: true,
        message: `Importación completada con éxito`,
        details: `Se han procesado ${validRecords + invalidRecords} registros.`,
        stats: {
          total: validRecords + invalidRecords,
          processed: validRecords,
          inserted: result.insertedCount,
          errors: invalidRecords
        }
      };
    } catch (error) {
      this.logger.error('Error en la importación de productos:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al procesar el archivo: ' + error.message);
    }
  }
}