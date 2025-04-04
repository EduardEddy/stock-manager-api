import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateSalesProductDto } from './dto/create-sales-product.dto';
import { UpdateSalesProductDto } from './dto/update-sales-product.dto';
import { SalesMediaService } from 'src/sales-media/sales-media.service';
import { SalesMedia } from 'src/sales-media/entities/sales-media.entity';
import { ProductsService } from 'src/products/products.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SalesProductService {
  private readonly logger = new Logger('SalesProductService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly salesMediaService: SalesMediaService,
    private readonly saleProduct: ProductsService,
  ) { }

  async create(createSalesProductDto: CreateSalesProductDto, userId: string) {
    try {

      let saleMedia: SalesMedia = await this.salesMediaService.findOne(createSalesProductDto.saleMediaId);
      this.logger.debug("Estamos llegando aca: ", saleMedia);
      if (!saleMedia) {
        saleMedia = await this.salesMediaService.create({ name: createSalesProductDto.saleMediaId, userId });
      }
      createSalesProductDto.saleMediaId = saleMedia.id;
      const salesProduct = await this.prisma.saleProduct.create({
        data: createSalesProductDto
      });

      await this.saleProduct.updateStock(
        createSalesProductDto.productId,
        createSalesProductDto.quantity, userId
      );

      return salesProduct;
    } catch (error) {
      this.logger.error("ERROR on SalesProductService create: ", error);
      throw new InternalServerErrorException("Error on create function");
    }
  }

  async findAll(userId: string) {
    return this.prisma.saleProduct.findMany({
      where: {
        product: {
          userId: userId, // Filtra por el usuario dueño del producto
        },
      },
      include: {
        product: true,
        saleMedia: true,
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} salesProduct`;
  }

  update(id: number, updateSalesProductDto: UpdateSalesProductDto) {
    return `This action updates a #${id} salesProduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} salesProduct`;
  }
}
