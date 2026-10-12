import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '@nestjs/config';

import { BankModule } from './bank/bank.module';

import { BankPayment } from './bank/entity/bank-payment.entity';

@Module({
  imports: [

    // =========================
    // CONFIGURATION
    // =========================

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // =========================
    // BANK DATABASE CONNECTION
    // =========================

    TypeOrmModule.forRoot({
      type: 'mysql',

      host: 'localhost',

      port: 3306,

      username: 'root',

      password: 'root123',

      database: 'trade_exchange',

      entities: [
        BankPayment,
      ],

      synchronize: false,

      logging: true,
    }),

    // =========================
    // BANK MODULE
    // =========================

    BankModule,

  ],
})
export class BankAppModule {}