import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config';
import { PassportModule } from '@nestjs/passport';

@Module({
  controllers: [SaleController],
  providers: [SaleService, PrismaService],
  imports: [
    //SalesProductModule,
    JwtModule.register({
      global: true,
      secret: envs.secretKey,
      signOptions: { expiresIn: '30d' },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
})
export class SaleModule { }
