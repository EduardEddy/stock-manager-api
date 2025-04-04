import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
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
}
