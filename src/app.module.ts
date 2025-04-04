import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegisterModule } from './register/register.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
//import { PriceProductHistoryService } from './price-product-history/price-product-history.service';
import { PriceProductHistoryModule } from './price-product-history/price-product-history.module';
import { SalesProductModule } from './sales-product/sales-product.module';
import { SalesMediaModule } from './sales-media/sales-media.module';
import { PrismaService } from './prisma/prisma.service';
import { UploadProductsModule } from './upload-products/upload-products.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [RegisterModule, AuthModule, ProductsModule, PriceProductHistoryModule, SalesProductModule, SalesMediaModule, UploadProductsModule, MulterModule.register({ dest: "./uploads" })],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }
