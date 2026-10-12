import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import {
  BankService,
} from './bank.service';

import {
  CreatePaymentDto,
} from './dto/create-payment.dto';

import {
  CreateWithdrawalDto,
} from './dto/create-withdrawal.dto';

@Controller('bank')
export class BankController {

  constructor(
    private readonly bankService: BankService,
  ) {}

  // =========================
  // CREATE BANK PAYMENT
  // =========================
  //
  // Called by the User Service
  // for deposits.
  // =========================

  @Post('payment')
  createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
  ) {

    return this.bankService.createPayment(
      createPaymentDto,
    );

  }

  // =========================
  // CREATE BANK WITHDRAWAL
  // =========================
  //
  // Called by the User Service
  // for withdrawals.
  // =========================

  @Post('withdrawal')
  createWithdrawal(
    @Body() createWithdrawalDto: CreateWithdrawalDto,
  ) {

    return this.bankService.createWithdrawal(
      createWithdrawalDto,
    );

  }

}