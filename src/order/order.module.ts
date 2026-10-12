import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  TradeOrder,
} from './entity/trade-order.entity';



import {
  User,
} from '../user/entity/user.entity';

import {
  TradingPair,
} from '../market/entity/trading-pair.entity';

import {
  MarketTicker,
} from '../market/entity/market-ticker.entity';

import {
  OrderController,
} from './order.controller';

import {
  OrderService,
} from './order.service';

import {
  AuthModule,
} from '../auth/auth.module';

import {
  WalletModule,
} from '../wallet/wallet.module';

import {
  MarketModule,
} from '../market/market.module';


import {
  OrderBookModule,
} from '../order-book/order-book.module';

import {
  MatchingEngineModule,
} from '../matching-engine/matching-engine.module';

@Module({

  imports: [

    TypeOrmModule.forFeature([

      TradeOrder,

      User,

      TradingPair,

      MarketTicker,

    ]),

    AuthModule,

    WalletModule,

    MarketModule,

    OrderBookModule,

   MatchingEngineModule,

  ],

  controllers: [
    OrderController,
  ],

  providers: [
    OrderService,
  ],

  exports: [
    OrderService,
  ],

})
export class OrderModule {}