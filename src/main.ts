import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('api admin ML');
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [envs.frontOrigin],
    credentials: true,
  });
  app.setGlobalPrefix('api')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  logger.log(`Server running on port ${envs.port}`);
  await app.listen(envs.port);
}
bootstrap();
