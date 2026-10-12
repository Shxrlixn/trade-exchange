import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  HttpModule,
} from '@nestjs/axios';

import {
  BankController,
} from './bank.controller';

import {
  BankService,
} from './bank.service';

import {
  BankPayment,
} from './entity/bank-payment.entity';

@Module({
  imports: [

    TypeOrmModule.forFeature([
      BankPayment,
    ]),

    HttpModule,

  ],

  controllers: [
    BankController,
  ],

  providers: [
    BankService,
  ],

  exports: [
    BankService,
  ],
})
export class BankModule {}