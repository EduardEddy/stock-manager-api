import { Module } from '@nestjs/common';
import { RegisterController } from './register.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { PrismaUserRepositoryAdapter } from './infrastructure/adapters/prisma-user.repository.adapter';
import { USER_REPOSITORY } from './domain/constants/injection-tokens';

@Module({
  controllers: [RegisterController],
  providers: [
    PrismaService,
    RegisterUserUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepositoryAdapter,
    }
  ],
})
export class RegisterModule { }
