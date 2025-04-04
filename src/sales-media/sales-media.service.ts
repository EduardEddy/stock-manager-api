import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateSalesMediaDto } from './dto/create-sales-media.dto';
import { UpdateSalesMediaDto } from './dto/update-sales-media.dto';
import { SalesMedia } from './entities/sales-media.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SalesMediaService {

  private readonly logger = new Logger('SalesMediaService');

  constructor(private readonly prisma: PrismaService) { }

  async create(createSalesMediaDto: CreateSalesMediaDto): Promise<SalesMedia> {
    try {
      return await this.prisma.saleMedia.create({ data: createSalesMediaDto });
    } catch (error) {
      this.logger.error("ERROR on SalesMediaService create: ", error);
      throw new InternalServerErrorException("Error on create function");
    }
  }

  findAll(userId: string) {
    try {
      return this.prisma.saleMedia.findMany({
        where: { userId }
      });
    } catch (error) {
      Logger.error("ERROR on SalesMediaService find all: ", error);
      throw new InternalServerErrorException("Error on SalesMediaService find all function");
    }
  }

  async findOne(id: string): Promise<SalesMedia> {
    try {
      return await this.prisma.saleMedia.findUnique({
        where: { id }
      })
    } catch (error) {
      Logger.error("ERROR on SalesMediaService find one: ", error);
      throw new InternalServerErrorException("Error on SalesMediaService find one function");
    }
  }

  update(id: number, updateSalesMediaDto: UpdateSalesMediaDto) {
    return `This action updates a #${id} salesMedia`;
  }

  remove(id: number) {
    return `This action removes a #${id} salesMedia`;
  }
}
