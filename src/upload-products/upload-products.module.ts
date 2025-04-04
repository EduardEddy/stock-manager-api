import { Module } from '@nestjs/common';
import { UploadProductsService } from './upload-products.service';
import { UploadProductsController } from './upload-products.controller';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from 'src/prisma/prisma.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  controllers: [UploadProductsController],
  providers: [UploadProductsService, PrismaService],
  imports: [
    JwtModule.register({
      global: true,
      secret: envs.secretKey,
      signOptions: { expiresIn: '30d' },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }), MulterModule.register({ dest: "./uploads" })
  ]
})
export class UploadProductsModule { }
