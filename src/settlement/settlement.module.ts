import { Module } from '@nestjs/common'; 
import { TypeOrmModule } from '@nestjs/typeorm'; 
 
import { SettlementController } from './settlement.controller'; 
 
import { Trade } from '../trade/entity/trade.entity'; 
import { TradingPair } from '../market/entity/trading-pair.entity'; 
 
import { SettlementService } from './settlement.service'; 
 
import { WalletModule } from '../wallet/wallet.module'; 
 
import { AuthModule } from '../auth/auth.module'; 
 
@Module({ 
  imports:[ 
    TypeOrmModule.forFeature([ 
      Trade, 
      TradingPair, 
    ]), 
 
    WalletModule, 
 
    AuthModule, 
  ], 
 
  controllers:[SettlementController], 
 
  providers:[SettlementService], 
 
  exports:[SettlementService], 
}) 
export class SettlementModule {}