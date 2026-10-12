import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import {
  BankWebhookDto,
} from './bank-webhook.dto';

import {
  DepositService,
} from '../../deposit/deposit.service';

import {
  WithdrawalService,
} from '../../withdrawal/withdrawal.service';

@Controller('bank')
export class BankWebhookController {

  constructor(

    private readonly depositService:
      DepositService,

    private readonly withdrawalService:
      WithdrawalService,

  ) {}

  // =========================
  // BANK WEBHOOK
  // =========================

  @Post('webhook')
  async webhook(
    @Body()
    bankWebhookDto: BankWebhookDto,
  ) {

    // =========================
    // DEPOSIT
    // =========================

    if (
      bankWebhookDto.type ===
      'DEPOSIT'
    ) {

      return this.depositService.handleWebhook(
        bankWebhookDto,
      );

    }

    // =========================
    // WITHDRAWAL
    // =========================

    if (
      bankWebhookDto.type ===
      'WITHDRAWAL'
    ) {

      return this.withdrawalService.handleWebhook(
        bankWebhookDto,
      );

    }

  }
}