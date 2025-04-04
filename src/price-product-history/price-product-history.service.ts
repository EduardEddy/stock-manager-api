import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PriceProductHistoryDto } from './dto/price-product-history.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PriceProductHistoryService extends PrismaClient {
  private readonly logger = new Logger('PriceProductHistoryService');
  //constructor(private readonly prisma: PrismaService) { }

  async create(priceProductHistoryDto: PriceProductHistoryDto) {
    try {
      return this.priceProductHistory.create({ data: priceProductHistoryDto });
    } catch (error) {
      this.logger.error("ERROR on create function: ", error);
      throw new BadRequestException("Error on create function");
    }
  }
}
