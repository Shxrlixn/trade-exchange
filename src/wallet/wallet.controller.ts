import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { WalletService } from './wallet.service';

import { CreateWalletBalanceDto } from './dto/create-wallet-balance.dto';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {

  constructor(
    private readonly walletService: WalletService,
  ) {}

  // =========================
  // CREATE WALLET
  // =========================

  @Post()
  create(@Req() req: any) {
    return this.walletService.create(
      req.user.userId,
    );
  }

  // =========================
  // ADD CURRENCY
  // =========================

  @Post('balance')
  addCurrency(
    @Req() req: any,
    @Body()
    createWalletBalanceDto: CreateWalletBalanceDto,
  ) {
    return this.walletService.addCurrency(
      req.user.userId,
      createWalletBalanceDto.currencyId,
    );
  }

  // =========================
  // GET WALLET
  // =========================

  @Get()
  findWallet(@Req() req: any) {
    return this.walletService.findWallet(
      req.user.userId,
    );
  }

  // =========================
  // GET PARTICULAR BALANCE
  // =========================

  @Get('balance/:currencyId')
  getBalance(
    @Req() req: any,
    @Param('currencyId')
    currencyId: string,
  ) {
    return this.walletService.getBalance(
      req.user.userId,
      Number(currencyId),
    );
  }
}