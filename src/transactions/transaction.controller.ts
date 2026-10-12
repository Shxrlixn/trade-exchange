import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import {
  TransactionService,
} from './transaction.service';

@Controller('transactions')
export class TransactionController {

  constructor(
    private readonly transactionService:
      TransactionService,
  ) {}

  // =========================
  // GET USER TRANSACTIONS
  // =========================
  // Temporary endpoint for viewing
  // a user's transaction history.

  @Get('user/:userId')
  findByUser(
    @Param(
      'userId',
      ParseIntPipe,
    )
    userId: number,
  ) {

    return this.transactionService.findByUser(
      userId,
    );
  }

  // =========================
  // GET TRANSACTION BY ID
  // =========================

  @Get(':transactionId')
  findOne(
    @Param('transactionId')
    transactionId: string,
  ) {

    return this.transactionService.findOne(
      transactionId,
    );
  }
}