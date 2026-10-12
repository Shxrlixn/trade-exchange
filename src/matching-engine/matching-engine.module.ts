import { Module } from '@nestjs/common';

import { MatchingEngineService } from './matching-engine.service';
import { OrderBookModule } from '../order-book/order-book.module';
import { TradeModule } from '../trade/trade.module';

@Module({
  imports: [
    OrderBookModule,
    TradeModule,
  ],
  providers: [
    MatchingEngineService,
  ],
  exports: [
    MatchingEngineService,
  ],
})
export class MatchingEngineModule {}