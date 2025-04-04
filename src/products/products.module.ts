import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PriceProductHistoryModule } from 'src/price-product-history/price-product-history.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [PriceProductHistoryModule,
    JwtModule.register({
      global: true,
      secret: envs.secretKey,
      signOptions: { expiresIn: '30d' },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService],
})
export class ProductsModule { }
