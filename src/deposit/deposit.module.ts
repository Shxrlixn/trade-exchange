import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  HttpModule,
} from '@nestjs/axios';

import { Deposit } from './entity/deposit.entity';

import { User } from '../user/entity/user.entity';

import { Currency } from '../currency/entity/currency.entity';

import { Wallet } from '../wallet/entity/wallet.entity';

import { WalletBalance } from '../wallet/entity/wallet-balance.entity';

import { DepositService } from './deposit.service';

import { DepositController } from './deposit.controller';

import { AuthModule } from '../auth/auth.module';

import {
  TransactionModule,
} from '../transactions/transaction.module';

@Module({

  imports: [

    TypeOrmModule.forFeature([
      Deposit,
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
    DepositController,
  ],

  providers: [
    DepositService,
  ],

  exports: [
    DepositService,
  ],

})
export class DepositModule {}