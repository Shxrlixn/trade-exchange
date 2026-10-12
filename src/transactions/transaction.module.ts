import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  TransactionController,
} from './transaction.controller';

import {
  TransactionService,
} from './transaction.service';

import {
  Transaction,
} from './entity/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
    ]),
  ],

  controllers: [
    TransactionController,
  ],

  providers: [
    TransactionService,
  ],

  // Export this because DepositModule and
  // WithdrawalModule will use it internally.

  exports: [
    TransactionService,
  ],
})
export class TransactionModule {}