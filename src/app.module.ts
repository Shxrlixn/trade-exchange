import { Module } from '@nestjs/common'; 
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { ConfigModule } from '@nestjs/config'; 
 
import { AppController } from './app.controller'; 
import { AppService } from './app.service'; 
 
import { UserModule } from './user/user.module'; 
import { WalletModule } from './wallet/wallet.module'; 
import { CurrencyModule } from './currency/currency.module'; 
import { DepositModule } from './deposit/deposit.module'; 
 
import { User } from './user/entity/user.entity'; 
import { Wallet } from './wallet/entity/wallet.entity'; 
import { WalletBalance } from './wallet/entity/wallet-balance.entity'; 
import { Currency } from './currency/entity/currency.entity'; 
 
import { RefreshToken } from './auth/entity/refresh-token.entity'; 
 
import { Deposit } from './deposit/entity/deposit.entity'; 
 
import { Transaction } from './transactions/entity/transaction.entity'; 
 
import { Withdrawal } from './withdrawal/entity/withdrawal.entity'; 
import { WithdrawalModule } from './withdrawal/withdrawal.module'; 

import { BankWebhookModule } from './bank/webhook/bank-webhook.module';

import { MarketModule } from './market/market.module';
import { TradingPair } from './market/entity/trading-pair.entity';
import { MarketTicker } from './market/entity/market-ticker.entity';
import { MarketTrade } from './market/entity/market-trade.entity';

import { OrderModule } from './order/order.module';
import { TradeOrder } from './order/entity/trade-order.entity';

import { Trade } from './trade/entity/trade.entity';
import { TradeHistory } from './trade/entity/trade-history.entity';
import { Tds } from './trade/entity/tds.entity';

import { TradeModule } from './trade/trade.module';

import { SettlementModule } from './settlement/settlement.module';

import { OrderBookModule } from './order-book/order-book.module';

import { MatchingEngineModule } from './matching-engine/matching-engine.module';

 
@Module({ 
  imports: [ 
 
    ConfigModule.forRoot({ 
      isGlobal: true, 
    }), 
 
    TypeOrmModule.forRoot({ 
      type: 'mysql', 
      host: 'localhost', 
      port: 3306, 
      username: 'root', 
      password: 'root123', 
      database: 'trade_exchange', 
 
      entities: [ 
        User, 
        Wallet, 
        WalletBalance, 
        Currency, 
        RefreshToken, 
        Deposit, 
        Transaction, 
        Withdrawal,
        TradingPair,
        MarketTicker,
        MarketTrade,
        TradeOrder,
        Trade,
       TradeHistory,
       Tds,
      ], 
 
      synchronize: false, 
    }), 
 
    UserModule, 
    WalletModule, 
    CurrencyModule, 
    DepositModule, 
    WithdrawalModule,
    BankWebhookModule,
    MarketModule,
    OrderModule,
    TradeModule,
    SettlementModule,
    OrderBookModule,
     MatchingEngineModule,
  ], 
 
  controllers: [ 
    AppController, 
  ], 
 
  providers: [ 
    AppService, 
  ], 
}) 
export class AppModule {}