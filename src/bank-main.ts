import { NestFactory } from '@nestjs/core';

import { ValidationPipe } from '@nestjs/common';

import { BankAppModule } from './bank-app.module';

async function bootstrap() {

  const app =
    await NestFactory.create(
      BankAppModule,
    );

  // =========================
  // VALIDATION
  // =========================

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // =========================
  // BANK SERVICE PORT
  // =========================

  await app.listen(4002);

  console.log(
    'Bank Service running on port 4002',
  );

}

bootstrap();