import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';

import { Currency } from './entity/currency.entity';
import { CurrencyService } from './currency.service';
import { CurrencyController } from './currency.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Currency]),
    AuthModule,
  ],

  controllers: [CurrencyController],

  providers: [CurrencyService],

  exports: [CurrencyService],
})
export class CurrencyModule {}