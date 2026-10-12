import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';

import { Wallet } from './entity/wallet.entity';
import { WalletBalance } from './entity/wallet-balance.entity';

import { User } from '../user/entity/user.entity';
import { Currency } from '../currency/entity/currency.entity';

import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { WalletGateway } from './wallet.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Wallet,
      WalletBalance,
      User,
      Currency,
    ]),
    AuthModule,
  ],

  controllers: [
    WalletController,
  ],

  providers: [
    WalletService,
    WalletGateway,
  ],

  exports: [
    WalletService,
    WalletGateway,
  ],
})
export class WalletModule {}