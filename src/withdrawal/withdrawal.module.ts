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
  WithdrawalController,
} from './withdrawal.controller';

import {
  WithdrawalService,
} from './withdrawal.service';

import {
  AuthModule,
} from '../auth/auth.module';

import {
  TransactionModule,
} from '../transactions/transaction.module';

import {
  Withdrawal,
} from './entity/withdrawal.entity';

import {
  User,
} from '../user/entity/user.entity';

import {
  Currency,
} from '../currency/entity/currency.entity';

import {
  Wallet,
} from '../wallet/entity/wallet.entity';

import {
  WalletBalance,
} from '../wallet/entity/wallet-balance.entity';

@Module({

  imports: [

    TypeOrmModule.forFeature([
      Withdrawal,
      User,
      Currency,
      Wallet,
      WalletBalance,
    ]),

    AuthModule,

    TransactionModule,

    HttpModule,

  ],

  controllers: [
    WithdrawalController,
  ],

  providers: [
    WithdrawalService,
  ],

  exports: [
  WithdrawalService,
],

})

export class WithdrawalModule {}