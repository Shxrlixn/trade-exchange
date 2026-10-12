import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  TradingPair,
} from './entity/trading-pair.entity';

import {
  Currency,
} from '../currency/entity/currency.entity';

import {
  AuthModule,
} from '../auth/auth.module';

import {
  MarketController,
} from './market.controller';

import {
  MarketService,
} from './market.service';
import { MarketTicker } from './entity/market-ticker.entity';
/*
import {
  MarketRedisService,
} from './redis/market-redis.service';
*/

import {
  MarketTrade,
} from './entity/market-trade.entity';



@Module({
  imports: [

    TypeOrmModule.forFeature([
      TradingPair,
      Currency,
      MarketTicker,
      MarketTrade

    ]),

    AuthModule,

  ],

  controllers: [
    MarketController,
  ],

  providers: [
    MarketService,
    //MarketRedisService
  ],

  exports: [
    MarketService,
  ],
})
export class MarketModule {}