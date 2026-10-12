import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  DataSource,
  Repository,
} from 'typeorm';

import {
  Trade,
} from '../trade/entity/trade.entity';

import {
  TradingPair,
} from '../market/entity/trading-pair.entity';

import {
  WalletService,
} from '../wallet/wallet.service';


@Injectable()
export class SettlementService {

  constructor(

    @InjectRepository(Trade)
    private tradeRepository:
      Repository<Trade>,

    @InjectRepository(TradingPair)
    private tradingPairRepository:
      Repository<TradingPair>,

    private walletService:
      WalletService,

    private dataSource:
      DataSource,

  ) {}


  // =========================
  // CREATE SETTLEMENT
  // =========================

  async createSettlement(
    tradeId: number,
    buyerTotalAmount: number,
    buyerSettlementQuantity: number,
    sellerSettlementAmount: number,
  ) {

    // =========================
    // VALIDATE TRADE
    // =========================

    const trade =
      await this.tradeRepository.findOne({

        where: {
          id: tradeId,
        },

      });


    if (!trade) {

      throw new NotFoundException(
        'Trade not found',
      );

    }


    // =========================
    // VALIDATE TRADING PAIR
    // =========================

    const tradingPair =
      await this.tradingPairRepository.findOne({

        where: {
          id:
            trade.tradingPairId,
        },

        relations: {
          baseAsset: true,
          quoteAsset: true,
        },

      });


    if (!tradingPair) {

      throw new NotFoundException(
        'Trading pair not found',
      );

    }


    // =========================
    // CHECK TRADING PAIR STATUS
    // =========================

    if (
      tradingPair.statusCode !== 1
    ) {

      throw new BadRequestException(
        'Trading pair is inactive',
      );

    }


    // =========================
    // CHECK EXISTING SETTLEMENT
    // =========================

    if (
      trade.settlementStatus ===
      'SETTLED'
    ) {

      return trade;

    }


    // =========================
    // VALIDATE AMOUNTS
    // =========================

    if (
      buyerTotalAmount <= 0
    ) {

      throw new BadRequestException(
        'Buyer settlement amount must be greater than zero',
      );

    }


    if (
      buyerSettlementQuantity <= 0
    ) {

      throw new BadRequestException(
        'Buyer settlement quantity must be greater than zero',
      );

    }


    if (
      sellerSettlementAmount < 0
    ) {

      throw new BadRequestException(
        'Seller settlement amount cannot be negative',
      );

    }


    // =========================
    // EXECUTED QUANTITY
    // =========================

    const executedQuantity =
      Number(
        trade.executedQuantity,
      );


    // =========================
    // SET SETTLEMENT PENDING
    // =========================

    trade.settlementStatus =
      'PENDING';

    trade.settlementStatusCode =
      0;

    await this.tradeRepository.save(
      trade,
    );


    // =========================
    // SETTLEMENT TRANSACTION
    // =========================

    try {

      await this.dataSource.transaction(
        async (manager) => {

          // =========================
          // BUYER
          // CREDIT BASE ASSET
          // =========================
          //
          // BUYER'S QUOTE ASSET
          // (INR) WAS ALREADY RESERVED
          // WHEN THE ORDER WAS CREATED.
          //
          // DO NOT DEBIT INR AGAIN.
          //
          // Buyer fee is deducted from
          // the Base Asset received.

          await this.walletService.credit(
            trade.buyerId,
            tradingPair.baseAssetId,
            buyerSettlementQuantity,
            manager,
          );


          // =========================
          // SELLER
          // CREDIT QUOTE ASSET
          // =========================
          //
          // SELLER'S BASE ASSET
          // (BTC) WAS ALREADY RESERVED
          // WHEN THE ORDER WAS CREATED.
          //
          // DO NOT DEBIT BTC AGAIN.
          //
          // Seller fee and TDS are
          // already deducted from
          // sellerSettlementAmount.

          await this.walletService.credit(
            trade.sellerId,
            tradingPair.quoteAssetId,
            sellerSettlementAmount,
            manager,
          );


          // =========================
          // COMPLETE SETTLEMENT
          // =========================

          trade.settlementStatus =
            'SETTLED';

          trade.settlementStatusCode =
            1;

          await manager
            .getRepository(Trade)
            .save(
              trade,
            );

        },
      );

    } catch (error) {

      // =========================
      // SETTLEMENT FAILED
      // =========================

      trade.settlementStatus =
        'FAILED';

      trade.settlementStatusCode =
        3;

      await this.tradeRepository.save(
        trade,
      );

      throw error;

    }


    // =========================
    // RETURN SETTLEMENT
    // =========================

    return {

      message:
        'Settlement completed successfully',

      settlement: {

        tradeId:
          trade.id,

        status:
          trade.settlementStatus,

        buyerTotalAmount,

        buyerSettlementQuantity,

        sellerSettlementAmount,

        executedQuantity,

        baseAsset:
          tradingPair.baseAsset.code,

        quoteAsset:
          tradingPair.quoteAsset.code,

        buyerId:
          trade.buyerId,

        sellerId:
          trade.sellerId,

      },

    };

  }


  // =========================
  // CREATE SETTLEMENT BY API
  // =========================

  async createSettlementByApi(
    tradeId: number,
  ) {

    // =========================
    // VALIDATE TRADE
    // =========================

    const trade =
      await this.tradeRepository.findOne({

        where: {
          id: tradeId,
        },

      });


    if (!trade) {

      throw new NotFoundException(
        'Trade not found',
      );

    }


    // =========================
    // CHECK EXISTING SETTLEMENT
    // =========================

    if (
      trade.settlementStatus ===
      'SETTLED'
    ) {

      return {

        message:
          'Trade is already settled',

        tradeId:
          trade.id,

        status:
          trade.settlementStatus,

      };

    }


    // =========================
    // API RESTRICTION
    // =========================

    throw new BadRequestException(
      'Settlement must be triggered by TradeService because settlement amounts are calculated internally',
    );

  }

}