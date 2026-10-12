import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  JwtAuthGuard,
} from '../auth/jwt-auth.guard';

import {
  MarketService,
} from './market.service';

import {
  CreateTradingPairDto,
} from './dto/create-trading-pair.dto';

import {
  UpdateTradingPairStatusDto,
} from './dto/update-trading-pair-status.dto';

import {
  CreateMarketTickerDto,
} from './dto/create-market-ticker.dto';

import {
  UpdateMarketTickerDto,
} from './dto/update-market-ticker.dto';

@Controller('market')
@UseGuards(JwtAuthGuard)
export class MarketController {

  constructor(
    private readonly marketService:
      MarketService,
  ) {}

  // =========================
  // CREATE TRADING PAIR
  // =========================

  @Post('pair')
  createTradingPair(
    @Body()
    createTradingPairDto:
      CreateTradingPairDto,
  ) {

    return this.marketService.createTradingPair(
      createTradingPairDto,
    );
  }

  // =========================
  // GET ALL TRADING PAIRS
  // =========================

  @Get('pair')
  findAllTradingPairs() {

    return this.marketService.findAllTradingPairs();
  }

  // =========================
  // GET TRADING PAIR BY NAME
  // =========================

  @Get('pair/:pairName')
  findTradingPairByName(
    @Param('pairName')
    pairName: string,
  ) {

    return this.marketService.findTradingPairByName(
      pairName,
    );
  }

  // =========================
  // UPDATE TRADING PAIR STATUS
  // =========================

  @Patch('pair/:id/status')
  updateTradingPairStatus(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    updateStatusDto:
      UpdateTradingPairStatusDto,
  ) {

    return this.marketService.updateTradingPairStatus(
      id,
      updateStatusDto,
    );
  }

  // =========================
  // CREATE MARKET TICKER
  // =========================

  @Post('ticker/:pairName')
  createMarketTicker(
    @Param('pairName')
    pairName: string,

    @Body()
    createMarketTickerDto:
      CreateMarketTickerDto,
  ) {

    return this.marketService.createMarketTicker(
      pairName,
      createMarketTickerDto,
    );
  }

  // =========================
  // GET ALL MARKET TICKERS
  // =========================

  @Get('ticker')
  findAllMarketTickers() {

    return this.marketService.findAllMarketTickers();
  }

  // =========================
  // GET MARKET TICKER BY PAIR
  // =========================

  @Get('ticker/:pairName')
  findMarketTickerByPair(
    @Param('pairName')
    pairName: string,
  ) {

    return this.marketService.findMarketTickerByPair(
      pairName,
    );
  }

  // =========================
  // PROCESS COMPLETED TRADE
  // =========================

  @Post('ticker/:pairName/trade')
  processCompletedTrade(
    @Param('pairName')
    pairName: string,

    @Body()
    updateMarketTickerDto:
      UpdateMarketTickerDto,
  ) {

    return this.marketService.processCompletedTrade(
      pairName,
      updateMarketTickerDto,
    );
  }
}