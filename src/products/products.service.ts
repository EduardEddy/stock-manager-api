import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PriceProductHistoryService } from 'src/price-product-history/price-product-history.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(private readonly prisma: PrismaService,
    private readonly productPriceHistory: PriceProductHistoryService
  ) { }

  async create(createProductDto: CreateProductDto, userId: string) {
    try {
      const { name, price, stock } = createProductDto;
      let product = { name, stock, price, userId };
      const productCreated = await this.prisma.product.create({ data: product });

      this.productPriceHistory.create({
        productId: productCreated.id,
        priceDollar: createProductDto.priceDollar,
        priceBuyLocalCurrency: createProductDto.priceBuyLocalCurrency,
        priceSaleLocalCurrency: createProductDto.price,
        reason: 'Creación de producto',
        changedBy: userId
      });
      return productCreated;
    } catch (error) {
      this.logger.error(`ERROR on ProductsService create: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Error on create function");
    }
  }

  findAll(userId: string) {
    try {
      return this.prisma.product.findMany({
        where: { userId }
      });
    } catch (error) {
      Logger.error(`ERROR on ProductsService find all: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Error on ProductsService find all function");
    }
  }

  findOne(id: string, userId: string) {
    try {
      return this.prisma.product.findUnique({
        where: { id, userId }
      })
    } catch (error) {
      Logger.error(`ERROR on ProductsService find one: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Error on ProductsService find one function");
    }
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }

  async updateStock(productId: string, quantity: number, userId: string) {
    try {
      const product = await this.findOne(productId.toString(), userId);

      if (product.stock < quantity) {
        throw new InternalServerErrorException("No hay suficiente stock");
      }

      return await this.prisma.product.update({
        where: { id: productId },
        data: {
          stock: product.stock - quantity
        }
      });
    } catch (error) {
      Logger.error("ERROR on ProductsService updateStock: ", error);
      throw new InternalServerErrorException("Error on ProductsService updateStock function");
    }
  }
}
