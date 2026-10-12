import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { WithdrawalService } from './withdrawal.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';

@Controller('withdrawal')
@UseGuards(JwtAuthGuard)
export class WithdrawalController {
  constructor(
    private readonly withdrawalService: WithdrawalService,
  ) {}

  // =========================
  // CREATE WITHDRAWAL
  // =========================

  @Post()
  create(
    @Body() createWithdrawalDto: CreateWithdrawalDto,
    @Req() req: any,
  ) {
    return this.withdrawalService.create(
      createWithdrawalDto,
      req.user.userId,
    );
  }
}