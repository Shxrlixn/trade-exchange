import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  JwtAuthGuard,
} from '../auth/jwt-auth.guard';

import {
  TradeService,
} from './trade.service';

import {
  CreateTradeDto,
} from './dto/create-trade.dto';


@Controller('trade')
@UseGuards(JwtAuthGuard)
export class TradeController {

  constructor(
    private readonly tradeService:
      TradeService,
  ) {}


  // =========================
  // CREATE TRADE
  // =========================

  @Post()
  createTrade(
    @Body()
    createTradeDto:
      CreateTradeDto,
  ) {

    return this.tradeService.createTrade(
      createTradeDto,
    );

  }


  // =========================
  // GET TRADE BY ID
  // =========================

  @Get(':id')
  findTradeById(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {

    return this.tradeService.findTradeById(
      id,
    );

  }


  // =========================
  // GET RECENT TRADES
  // =========================

  @Get('recent/:tradingPairId')
  findRecentTrades(
    @Param(
      'tradingPairId',
      ParseIntPipe,
    )
    tradingPairId: number,
  ) {

    return this.tradeService.findRecentTrades(
      tradingPairId,
    );

  }


  // =========================
  // GET USER TRADE HISTORY
  // =========================

  @Get('history/user/:userId')
  findTradeHistory(
    @Param(
      'userId',
      ParseIntPipe,
    )
    userId: number,
  ) {

    return this.tradeService.findTradeHistory(
      userId,
    );

  }

}