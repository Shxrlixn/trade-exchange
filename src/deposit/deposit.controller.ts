import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { DepositService } from './deposit.service';

import { CreateDepositDto } from './dto/create-deposit.dto';

@Controller('deposit')
@UseGuards(JwtAuthGuard)
export class DepositController {

  constructor(
    private readonly depositService: DepositService,
  ) {}

  // =========================
  // CREATE DEPOSIT
  // =========================

  @Post()
  create(
    @Body() createDepositDto: CreateDepositDto,
    @Req() req: any,
  ) {

    return this.depositService.create(
      createDepositDto,
      req.user.userId,
    );

  }

}