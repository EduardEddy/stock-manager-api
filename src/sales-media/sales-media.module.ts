import { Module } from '@nestjs/common';
import { SalesMediaService } from './sales-media.service';
import { SalesMediaController } from './sales-media.controller';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from 'src/prisma/prisma.service';
import { SalesProductService } from 'src/sales-product/sales-product.service';
import { ProductsService } from 'src/products/products.service';
import { PriceProductHistoryService } from 'src/price-product-history/price-product-history.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: envs.secretKey,
      signOptions: { expiresIn: '30d' },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [SalesMediaController],
  providers: [
    SalesMediaService,
    PrismaService,
    SalesProductService,
    ProductsService,
    PriceProductHistoryService
  ],
})
export class SalesMediaModule { }
