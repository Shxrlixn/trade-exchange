import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';

import {
  TradingPair,
} from './entity/trading-pair.entity';

import {
  MarketTicker,
} from './entity/market-ticker.entity';

import {
  MarketTrade,
} from './entity/market-trade.entity';

import {
  Currency,
} from '../currency/entity/currency.entity';

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


@Injectable()
export class MarketService {

  constructor(

    @InjectRepository(TradingPair)
    private tradingPairRepository:
      Repository<TradingPair>,

    @InjectRepository(Currency)
    private currencyRepository:
      Repository<Currency>,

    @InjectRepository(MarketTicker)
    private marketTickerRepository:
      Repository<MarketTicker>,

    @InjectRepository(MarketTrade)
    private marketTradeRepository:
      Repository<MarketTrade>,

  ) {}

  // =========================
  // CREATE TRADING PAIR
  // =========================

  async createTradingPair(
    createTradingPairDto:
      CreateTradingPairDto,
  ) {

    // =========================
    // PREVENT SAME ASSET
    // =========================

    if (
      createTradingPairDto.baseAssetId ===
      createTradingPairDto.quoteAssetId
    ) {

      throw new BadRequestException(
        'Base asset and quote asset cannot be the same',
      );
    }


    // =========================
    // FIND BASE ASSET
    // =========================

    const baseAsset =
      await this.currencyRepository.findOne({
        where: {
          id:
            createTradingPairDto.baseAssetId,
        },
      });


    if (!baseAsset) {

      throw new NotFoundException(
        'Base asset not found',
      );
    }


    // =========================
    // FIND QUOTE ASSET
    // =========================

    const quoteAsset =
      await this.currencyRepository.findOne({
        where: {
          id:
            createTradingPairDto.quoteAssetId,
        },
      });


    if (!quoteAsset) {

      throw new NotFoundException(
        'Quote asset not found',
      );
    }


    // =========================
    // CHECK CURRENCY STATUS
    // =========================

    if (
      baseAsset.statusCode !== 1 ||
      quoteAsset.statusCode !== 1
    ) {

      throw new BadRequestException(
        'Both assets must be active',
      );
    }


    // =========================
    // GENERATE PAIR NAME
    // =========================

    const pairName =
      `${baseAsset.code}-${quoteAsset.code}`;


    // =========================
    // CHECK DUPLICATE PAIR
    // =========================

    const existingPair =
      await this.tradingPairRepository.findOne({
        where: {
          pairName,
        },
      });


    if (existingPair) {

      throw new BadRequestException(
        'Trading pair already exists',
      );
    }


    // =========================
    // CREATE TRADING PAIR
    // =========================

    const tradingPair =
      this.tradingPairRepository.create({

        pairName,

        baseAsset,

        baseAssetId:
          baseAsset.id,

        quoteAsset,

        quoteAssetId:
          quoteAsset.id,

        status:
          'ACTIVE',

        statusCode:
          1,

      });


    return await this.tradingPairRepository.save(
      tradingPair,
    );
  }


  // =========================
  // GET ALL TRADING PAIRS
  // =========================

  async findAllTradingPairs() {

    return await this.tradingPairRepository.find({
      relations: {
        baseAsset: true,
        quoteAsset: true,
      },

      order: {
        id: 'ASC',
      },
    });
  }


  // =========================
  // GET TRADING PAIR BY NAME
  // =========================

  async findTradingPairByName(
    pairName: string,
  ) {

    const tradingPair =
      await this.tradingPairRepository.findOne({
        where: {
          pairName:
            pairName.toUpperCase(),
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


    return tradingPair;
  }


  // =========================
  // UPDATE TRADING PAIR STATUS
  // =========================

  async updateTradingPairStatus(
    id: number,
    updateStatusDto:
      UpdateTradingPairStatusDto,
  ) {

    const tradingPair =
      await this.tradingPairRepository.findOne({
        where: {
          id,
        },
      });


    if (!tradingPair) {

      throw new NotFoundException(
        'Trading pair not found',
      );
    }


    if (
      updateStatusDto.statusCode === 1
    ) {

      tradingPair.status =
        'ACTIVE';

      tradingPair.statusCode =
        1;

    } else {

      tradingPair.status =
        'INACTIVE';

      tradingPair.statusCode =
        2;
    }


    return await this.tradingPairRepository.save(
      tradingPair,
    );
  }


  // =========================
  // CREATE MARKET TICKER
  // =========================

  async createMarketTicker(
    pairName: string,
    createMarketTickerDto:
      CreateMarketTickerDto,
  ) {

    // =========================
    // FIND TRADING PAIR
    // =========================

    const tradingPair =
      await this.tradingPairRepository.findOne({
        where: {
          pairName:
            pairName.toUpperCase(),
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
    // CHECK EXISTING TICKER
    // =========================

    const existingTicker =
      await this.marketTickerRepository.findOne({
        where: {
          tradingPairId:
            tradingPair.id,
        },
      });


    if (existingTicker) {

      throw new ConflictException(
        'Market ticker already exists',
      );
    }


    // =========================
    // CREATE MARKET TICKER
    // =========================

    const marketTicker =
      this.marketTickerRepository.create({

        tradingPair,

        tradingPairId:
          tradingPair.id,

        currentPrice:
          createMarketTickerDto.currentPrice,

        change24h:
          createMarketTickerDto.change24h,

        high24h:
          createMarketTickerDto.high24h,

        low24h:
          createMarketTickerDto.low24h,

        volume24h:
          createMarketTickerDto.volume24h,

      });


    return await this.marketTickerRepository.save(
      marketTicker,
    );
  }


  // =========================
  // GET ALL MARKET TICKERS
  // =========================

  async findAllMarketTickers() {

    return await this.marketTickerRepository.find({
      relations: {
        tradingPair: true,
      },

      order: {
        id: 'ASC',
      },
    });
  }


  // =========================
  // GET MARKET TICKER BY PAIR
  // =========================

  async findMarketTickerByPair(
    pairName: string,
  ) {

    const tradingPair =
      await this.tradingPairRepository.findOne({
        where: {
          pairName:
            pairName.toUpperCase(),
        },
      });


    if (!tradingPair) {

      throw new NotFoundException(
        'Trading pair not found',
      );
    }


    const marketTicker =
      await this.marketTickerRepository.findOne({
        where: {
          tradingPairId:
            tradingPair.id,
        },

        relations: {
          tradingPair: true,
        },
      });


    if (!marketTicker) {

      throw new NotFoundException(
        'Market ticker not found',
      );
    }


    return marketTicker;
  }


  // =========================
  // PROCESS COMPLETED TRADE
  // =========================

  async processCompletedTrade(
    pairName: string,
    updateMarketTickerDto:
      UpdateMarketTickerDto,
  ) {

    // =========================
    // FIND TRADING PAIR
    // =========================

    const tradingPair =
      await this.tradingPairRepository.findOne({
        where: {
          pairName:
            pairName.toUpperCase(),
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
    // FIND MARKET TICKER
    // =========================

    const marketTicker =
      await this.marketTickerRepository.findOne({
        where: {
          tradingPairId:
            tradingPair.id,
        },
      });


    if (!marketTicker) {

      throw new NotFoundException(
        'Market ticker not found',
      );
    }


    // =========================
    // SAVE COMPLETED TRADE
    // =========================

    const tradeTime =
      updateMarketTickerDto.timestamp
        ? new Date(updateMarketTickerDto.timestamp)
        : new Date();


    const marketTrade =
      this.marketTradeRepository.create({

        tradingPair,

        tradingPairId:
          tradingPair.id,

        price:
          updateMarketTickerDto.price,

        quantity:
          updateMarketTickerDto.quantity,

        tradeTime,

      });


    await this.marketTradeRepository.save(
      marketTrade,
    );


    // =========================
    // FIND LAST 24 HOUR TRADES
    // =========================

    const twentyFourHoursAgo =
      new Date(
        tradeTime.getTime() -
        24 * 60 * 60 * 1000,
      );


    const recentTrades =
      await this.marketTradeRepository.find({
        where: {
          tradingPairId:
            tradingPair.id,

          tradeTime:
            MoreThanOrEqual(
              twentyFourHoursAgo,
            ),
        },

        order: {
          tradeTime: 'ASC',
        },
      });


    if (recentTrades.length === 0) {

      throw new NotFoundException(
        'No trades found for the last 24 hours',
      );
    }


    // =========================
    // CALCULATE CURRENT PRICE
    // =========================

    const latestTrade =
      recentTrades[
        recentTrades.length - 1
      ];

    marketTicker.currentPrice =
      Number(latestTrade.price);


    // =========================
    // CALCULATE HIGH PRICE
    // =========================

    marketTicker.high24h =
      Math.max(
        ...recentTrades.map(
          (trade) =>
            Number(trade.price),
        ),
      );


    // =========================
    // CALCULATE LOW PRICE
    // =========================

    marketTicker.low24h =
      Math.min(
        ...recentTrades.map(
          (trade) =>
            Number(trade.price),
        ),
      );


    // =========================
    // CALCULATE 24H VOLUME
    // =========================

    marketTicker.volume24h =
      recentTrades.reduce(
        (total, trade) =>
          total +
          Number(trade.quantity),

        0,
      );


    // =========================
    // CALCULATE 24H CHANGE
    // =========================

    const trade24HoursAgo =
      await this.marketTradeRepository.findOne({
        where: {
          tradingPairId:
            tradingPair.id,

          tradeTime:
            LessThanOrEqual(
              twentyFourHoursAgo,
            ),
        },

        order: {
          tradeTime: 'DESC',
        },
      });


    const currentPrice =
      Number(latestTrade.price);


    if (
      trade24HoursAgo &&
      Number(trade24HoursAgo.price) > 0
    ) {

      const price24HoursAgo =
        Number(trade24HoursAgo.price);

      marketTicker.change24h =
        (
          (
            currentPrice -
            price24HoursAgo
          ) /
          price24HoursAgo
        ) *
        100;

    } else {

      marketTicker.change24h =
        0;
    }


    // =========================
    // SAVE MARKET TICKER
    // =========================

    return await this.marketTickerRepository.save(
      marketTicker,
    );
  }
}