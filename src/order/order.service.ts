import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  TradeOrder,
} from './entity/trade-order.entity';

import {
  CreateOrderDto,
} from './dto/create-order.dto';

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
  WalletService,
} from '../wallet/wallet.service';

import {
  MatchingEngineService,
} from '../matching-engine/matching-engine.service';

import {
  OrderBookService,
} from '../order-book/order-book.service';


@Injectable()
export class OrderService {


  constructor(

    @InjectRepository(TradeOrder)
    private tradeOrderRepository:
      Repository<TradeOrder>,

    @InjectRepository(User)
    private userRepository:
      Repository<User>,

    @InjectRepository(TradingPair)
    private tradingPairRepository:
      Repository<TradingPair>,

    @InjectRepository(MarketTicker)
    private marketTickerRepository:
      Repository<MarketTicker>,

    private walletService:
      WalletService,

    private orderBookService:
      OrderBookService,

    private matchingEngineService:
      MatchingEngineService,

  ) {}


  // =========================
  // GET FILLED QUANTITY
  // =========================

  private async getOrderFills(
    orderId: number,
  ) {

    const result =
      await this.tradeOrderRepository.query(
        `
        SELECT

          COALESCE(
            SUM(executedQuantity),
            0
          ) AS filledQuantity,

          COALESCE(
            SUM(
              executedPrice * executedQuantity
            ),
            0
          ) AS filledQuoteValue

        FROM trade_settlement

        WHERE
          buyOrderId = ?
          OR sellOrderId = ?
        `,
        [
          orderId,
          orderId,
        ],
      );


    return {

      filledQuantity:
        Number(
          result[0]?.filledQuantity ?? 0,
        ),

      filledQuoteValue:
        Number(
          result[0]?.filledQuoteValue ?? 0,
        ),

    };
  }


  // =========================
  // CALCULATE REFUND
  // =========================

  private async calculateRefund(
    order: TradeOrder,
  ): Promise<number> {


    const {
      filledQuantity,
      filledQuoteValue,
    } = await this.getOrderFills(
      order.id,
    );


    // =========================
    // BUY
    // =========================

    //
    // BUY reserves quote currency.
    //
    // Example:
    //
    // BUY 10 BTC @ 100
    // Reserved = 1000 INR
    //
    // Filled:
    // 4 BTC @ 98
    // Used = 392 INR
    //
    // Refund:
    // 1000 - 392 = 608 INR
    //
    // =========================

    if (
      order.side === 'BUY'
    ) {

      const originalReserved =
        Number(order.orderValue);

      return Math.max(
        0,
        originalReserved -
          filledQuoteValue,
      );
    }


    // =========================
    // SELL
    // =========================

    //
    // SELL reserves base currency.
    //
    // Example:
    //
    // SELL 10 BTC
    //
    // Filled = 4 BTC
    //
    // Refund = 6 BTC
    //
    // =========================

    const originalReserved =
      Number(order.orderQuantity);

    return Math.max(
      0,
      originalReserved -
        filledQuantity,
    );
  }


  // =========================
  // CREATE ORDER
  // =========================

  async createOrder(
    createOrderDto: CreateOrderDto,
    userId: number,
  ) {


    // =========================
    // CHECK USER
    // =========================

    const user =
      await this.userRepository.findOne({

        where: {
          id: userId,
        },

      });


    if (!user) {

      throw new NotFoundException(
        'User not found',
      );

    }


    // =========================
    // CHECK TRADING PAIR
    // =========================

    const tradingPair =
      await this.tradingPairRepository.findOne({

        where: {

          id:
            createOrderDto.tradingPairId,

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
    // VALIDATE ORDER TYPE
    // =========================

    if (
      !['LIMIT', 'MARKET']
        .includes(
          createOrderDto.orderType,
        )
    ) {

      throw new BadRequestException(
        'Invalid order type',
      );

    }


    // =========================
    // VALIDATE SIDE
    // =========================

    if (
      !['BUY', 'SELL']
        .includes(
          createOrderDto.side,
        )
    ) {

      throw new BadRequestException(
        'Invalid order side',
      );

    }


    // =========================
    // VALIDATE QUANTITY
    // =========================

    if (
      createOrderDto.quantity <= 0
    ) {

      throw new BadRequestException(
        'Quantity must be greater than zero',
      );

    }


    // =========================
    // VALIDATE LIMIT PRICE
    // =========================

    if (
      createOrderDto.orderType === 'LIMIT'
      &&
      (
        createOrderDto.orderPrice === undefined
        ||
        createOrderDto.orderPrice === null
        ||
        createOrderDto.orderPrice <= 0
      )
    ) {

      throw new BadRequestException(
        'Price is required for LIMIT order',
      );

    }


    // =========================
    // MARKET ORDER PRICE
    // =========================

    let orderPrice =
      createOrderDto.orderPrice ?? null;


    if (
      createOrderDto.orderType === 'MARKET'
    ) {

      const ticker =
        await this.marketTickerRepository.findOne({

          where: {

            tradingPairId:
              tradingPair.id,

          },

        });


      if (!ticker) {

        throw new NotFoundException(
          'Market ticker not found',
        );

      }


      if (
        ticker.currentPrice <= 0
      ) {

        throw new BadRequestException(
          'Current market price is invalid',
        );

      }


      /*
       * For a MARKET order,
       * current market price is used
       * to calculate the amount
       * that needs to be deducted.
       *
       * Actual execution price is
       * determined later by the
       * Matching Engine.
       */

      orderPrice =
        ticker.currentPrice;

    }


    // =========================
    // CALCULATE ORDER VALUE
    // =========================

    const orderValue =
      Number(orderPrice!) *
      Number(createOrderDto.quantity);


    // =========================
    // DETERMINE BALANCE
    // =========================

    let currencyId: number;

    let requiredAmount: number;


    if (
      createOrderDto.side === 'BUY'
    ) {

      /*
       * BUY:
       *
       * Deduct quote currency.
       *
       * Example:
       * USDT-INR
       *
       * BUY 10 USDT
       * at 98.63 INR
       *
       * Deduct 986.30 INR
       */

      currencyId =
        tradingPair.quoteAssetId;


      requiredAmount =
        orderValue;


    } else {

      /*
       * SELL:
       *
       * Deduct base currency.
       *
       * Example:
       * USDT-INR
       *
       * SELL 10 USDT
       *
       * Deduct 10 USDT
       */

      currencyId =
        tradingPair.baseAssetId;


      requiredAmount =
        Number(
          createOrderDto.quantity,
        );

    }


    // =========================
    // DEDUCT USER BALANCE
    // =========================

    await this.walletService.debit(
      userId,
      currencyId,
      requiredAmount,
    );


    // Keep reference outside try
    // so partial-fill errors can
    // calculate the correct refund.

    let savedOrder:
      TradeOrder | null = null;


    try {


      // =========================
      // CREATE TRADE ORDER
      // =========================

      const tradeOrder =
        this.tradeOrderRepository.create({

          user,

          tradingPair,

          orderPrice,

          orderQuantity:
            createOrderDto.quantity,

          orderValue,

          side:
            createOrderDto.side,

          orderType:
            createOrderDto.orderType,

          status:
            'OPEN',

          statusCode:
            1,

          orderPlacedAt:
            new Date(),

        });


      savedOrder =
        await this.tradeOrderRepository.save(
          tradeOrder,
        );


      // =========================
      // SEND TO MATCHING ENGINE
      // =========================

      await this.matchingEngineService.processOrder(
        savedOrder,
      );


      return {


        message:
          'Order created successfully',


        order: {

          id:
            savedOrder.id,

          publicUuid:
            savedOrder.publicUuid,

          tradingPairId:
            tradingPair.id,

          orderType:
            savedOrder.orderType,

          side:
            savedOrder.side,

          orderPrice:
            savedOrder.orderPrice,

          orderQuantity:
            savedOrder.orderQuantity,

          orderValue:
            savedOrder.orderValue,

          status:
            savedOrder.status,

          orderPlacedAt:
            savedOrder.orderPlacedAt,

        },


      };


    } catch (error) {


      // =========================
      // RESTORE ONLY UNUSED BALANCE
      // =========================
      //
      // If matching failed after
      // partial execution, refund
      // only the remaining amount.
      //
      // =========================


      if (savedOrder) {

        const refundAmount =
          await this.calculateRefund(
            savedOrder,
          );


        if (
          refundAmount > 0
        ) {

          await this.walletService.credit(
            userId,
            currencyId,
            refundAmount,
          );

        }


      } else {

        // Order was never saved.
        // Nothing could have been
        // executed.

        await this.walletService.credit(
          userId,
          currencyId,
          requiredAmount,
        );

      }


      throw error;

    }

  }


  // =========================
  // GET CURRENT ORDERS
  // =========================

  async findCurrentOrders(
    userId: number,
  ) {

    return this.tradeOrderRepository.find({

      where: {

        user: {

          id: userId,

        },

      },

      relations: {

        tradingPair: true,

      },

      order: {

        createdAt: 'DESC',

      },

    });

  }


  // =========================
  // GET ORDER BY ID
  // =========================

  async findOrderById(
    id: number,
    userId: number,
  ) {

    const order =
      await this.tradeOrderRepository.findOne({

        where: {

          id,

          user: {

            id: userId,

          },

        },

        relations: {

          tradingPair: true,

        },

      });


    if (!order) {

      throw new NotFoundException(
        'Order not found',
      );

    }


    return order;

  }


  // =========================
  // CANCEL ORDER
  // =========================

  async cancelOrder(
    id: number,
    userId: number,
  ) {


    // =========================
    // FIND ORDER
    // =========================

    const order =
      await this.tradeOrderRepository.findOne({

        where: {

          id,

          user: {

            id: userId,

          },

        },

        relations: {

          user: true,

          tradingPair: true,

        },

      });


    if (!order) {

      throw new NotFoundException(
        'Order not found',
      );

    }


    // =========================
    // CHECK ACTIVE STATUS
    // =========================
    //
    // OPEN and PARTIALLY_FILLED
    // can both be cancelled.
    //
    // =========================

    if (
      order.status !== 'OPEN'
      &&
      order.status !== 'PARTIALLY_FILLED'
    ) {

      throw new BadRequestException(
        'Order cannot be cancelled',
      );

    }


    // =========================
    // CALCULATE REMAINING REFUND
    // =========================

    const refundAmount =
      await this.calculateRefund(
        order,
      );


    // =========================
    // DETERMINE BALANCE
    // =========================

    let currencyId: number;


    if (
      order.side === 'BUY'
    ) {

      currencyId =
        order.tradingPair.quoteAssetId;

    } else {

      currencyId =
        order.tradingPair.baseAssetId;

    }


    // =========================
    // RESTORE REMAINING BALANCE
    // =========================

    if (
      refundAmount > 0
    ) {

      await this.walletService.credit(
        userId,
        currencyId,
        refundAmount,
      );

    }


    // =========================
    // REMOVE FROM ORDER BOOK
    // =========================

    if (
      order.orderType === 'LIMIT'
    ) {

      this.orderBookService.removeOrder(
        order.tradingPairId,
        order.id,
      );

    }


    // =========================
    // UPDATE ORDER STATUS
    // =========================

    const {
      filledQuantity,
    } = await this.getOrderFills(
      order.id,
    );


    if (filledQuantity > 0) {

      order.status =
        'PARTIALLY_CANCELLED';

      order.statusCode =
        4;

    } else {

      order.status =
        'CANCELLED';

      order.statusCode =
        5;

    }


    const updatedOrder =
      await this.tradeOrderRepository.save(
        order,
      );


    return {


      message:
        'Order cancelled successfully',


      orderId:
        updatedOrder.id,


      status:
        updatedOrder.status,


      refundedAmount:
        refundAmount,


    };

  }


}