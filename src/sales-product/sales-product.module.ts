import { Module } from '@nestjs/common';
import { SalesProductService } from './sales-product.service';
import { SalesProductController } from './sales-product.controller';
import { SalesMediaModule } from 'src/sales-media/sales-media.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { SalesMediaService } from 'src/sales-media/sales-media.service';
import { ProductsService } from 'src/products/products.service';
import { PriceProductHistoryService } from 'src/price-product-history/price-product-history.service';

@Module({
  controllers: [SalesProductController],
  providers: [
    SalesProductService,
    PrismaService,
    SalesMediaService,
    ProductsService,
    PriceProductHistoryService
  ],
  imports: [
    SalesMediaModule,
    JwtModule.register({
      global: true,
      secret: envs.secretKey,
      signOptions: { expiresIn: '30d' },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
})
export class SalesProductModule { }
