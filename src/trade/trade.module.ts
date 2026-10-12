import { 
  Module, 
} from '@nestjs/common'; 
 
import { 
  TypeOrmModule, 
} from '@nestjs/typeorm'; 
 
import { 
  Trade, 
} from './entity/trade.entity'; 
 
 
import { 
  TradeHistory, 
} from './entity/trade-history.entity'; 
 
import { 
  Tds, 
} from './entity/tds.entity'; 
 
import { 
  User, 
} from '../user/entity/user.entity'; 
 
import { 
  TradingPair, 
} from '../market/entity/trading-pair.entity'; 
 
import { 
  MarketModule, 
} from '../market/market.module'; 
 
import { 
  AuthModule, 
} from '../auth/auth.module'; 
 
import { 
  TradeController, 
} from './trade.controller'; 
 
import { 
  TradeService, 
} from './trade.service'; 

import {
  SettlementModule,
} from '../settlement/settlement.module';
 
 
@Module({ 
 
  imports: [ 
 
    TypeOrmModule.forFeature([ 
 
      Trade, 
 
      TradeHistory, 
 
      Tds, 
 
      User, 
 
      TradingPair, 
 
    ]), 
 
    AuthModule, 
 
    MarketModule, 

    SettlementModule,
 
  ], 
 
  controllers: [ 
    TradeController, 
  ], 
 
  providers: [ 
    TradeService, 
  ], 
 
  exports: [ 
    TradeService, 
  ], 
 
}) 
export class TradeModule {}