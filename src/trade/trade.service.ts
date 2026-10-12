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
} from './entity/trade.entity';

import {
  Tds,
} from './entity/tds.entity';

import {
  CreateTradeDto,
} from './dto/create-trade.dto';

import {
  User,
} from '../user/entity/user.entity';

import {
  TradingPair,
} from '../market/entity/trading-pair.entity';

import {
  MarketService,
} from '../market/market.service';

import {
  SettlementService,
} from '../settlement/settlement.service';


@Injectable()
export class TradeService {


  constructor(


    @InjectRepository(Trade)
    private tradeRepository:
      Repository<Trade>,


    @InjectRepository(Tds)
    private tdsRepository:
      Repository<Tds>,


    @InjectRepository(User)
    private userRepository:
      Repository<User>,


    @InjectRepository(TradingPair)
    private tradingPairRepository:
      Repository<TradingPair>,


    private marketService:
      MarketService,


    private dataSource:
      DataSource,


    private readonly settlementService:
      SettlementService,


  ) {}



  // =========================
  // CREATE TRADE
  // =========================


  async createTrade(
    createTradeDto: CreateTradeDto,
  ) {


    // =========================
    // VALIDATE BUYER
    // =========================


    const buyer =
      await this.userRepository.findOne({


        where: {

          id:
            createTradeDto.buyerId,

        },


      });



    if (!buyer) {


      throw new NotFoundException(
        'Buyer not found',
      );


    }



    // =========================
    // VALIDATE SELLER
    // =========================


    const seller =
      await this.userRepository.findOne({


        where: {

          id:
            createTradeDto.sellerId,

        },


      });



    if (!seller) {


      throw new NotFoundException(
        'Seller not found',
      );


    }



    // =========================
    // VALIDATE BUYER / SELLER
    // =========================


    if (
      createTradeDto.buyerId ===
      createTradeDto.sellerId
    ) {


      throw new BadRequestException(
        'Buyer and seller cannot be the same user',
      );


    }



    // =========================
    // VALIDATE TRADING PAIR
    // =========================


    const tradingPair =
      await this.tradingPairRepository.findOne({


        where: {

          id:
            createTradeDto.tradingPairId,

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
    // VALIDATE ORDERS
    // =========================


    if (
      createTradeDto.buyOrderId ===
      createTradeDto.sellOrderId
    ) {


      throw new BadRequestException(
        'Buy order and sell order cannot be the same',
      );


    }



    // =========================
    // VALIDATE MAKER / TAKER
    // =========================


    if (
      createTradeDto.makerOrderId !==
        createTradeDto.buyOrderId
      &&
      createTradeDto.makerOrderId !==
        createTradeDto.sellOrderId
    ) {


      throw new BadRequestException(
        'Maker order must be the buy or sell order',
      );


    }



    if (
      createTradeDto.takerOrderId !==
        createTradeDto.buyOrderId
      &&
      createTradeDto.takerOrderId !==
        createTradeDto.sellOrderId
    ) {


      throw new BadRequestException(
        'Taker order must be the buy or sell order',
      );


    }



    if (
      createTradeDto.makerOrderId ===
      createTradeDto.takerOrderId
    ) {


      throw new BadRequestException(
        'Maker and taker orders cannot be the same',
      );


    }



    // =========================
    // VALIDATE PRICE
    // =========================


    if (
      createTradeDto.executedPrice <= 0
    ) {


      throw new BadRequestException(
        'Executed price must be greater than zero',
      );


    }



    // =========================
    // VALIDATE EXECUTED QUANTITY
    // =========================


    if (
      createTradeDto.executedQuantity <= 0
    ) {


      throw new BadRequestException(
        'Executed quantity must be greater than zero',
      );


    }



    // =========================
    // VALIDATE TDS RATE
    // =========================


    if (
      createTradeDto.tdsRate < 0 ||
      createTradeDto.tdsRate > 100
    ) {


      throw new BadRequestException(
        'TDS rate must be between 0 and 100',
      );


    }



    // =========================
    // CALCULATE BASIC VALUES
    // =========================


    const executedPrice =
      Number(
        createTradeDto.executedPrice,
      );



    const executedQuantity =
      Number(
        createTradeDto.executedQuantity,
      );



    const filledQuantity =
      executedQuantity;



    // Trade Value

    const tradeValue =
      executedPrice *
      executedQuantity;



    // =========================
    // IDENTIFY MAKER / TAKER
    // =========================


    const makerIsBuyer =
      createTradeDto.makerOrderId ===
      createTradeDto.buyOrderId;



    const makerUser =
      makerIsBuyer
        ? buyer
        : seller;



    const takerUser =
      makerIsBuyer
        ? seller
        : buyer;



    // =========================
    // GET FEE RATES
    // =========================


    const makerFeeRate =
      Number(
        tradingPair.makerFee,
      );



    const takerFeeRate =
      Number(
        tradingPair.takerFee,
      );



    // =========================
    // IDENTIFY BUYER / SELLER FEE
    // =========================

    const buyerFeeRate =
      makerIsBuyer
        ? makerFeeRate
        : takerFeeRate;


    const sellerFeeRate =
      makerIsBuyer
        ? takerFeeRate
        : makerFeeRate;



    // =========================
    // CALCULATE FEE AMOUNTS
    // =========================

    // BUYER FEE
    // Buyer receives Base Asset.
    // Therefore buyer fee is calculated
    // from executed quantity.

    const buyerFeeAmount =
      executedQuantity *
      buyerFeeRate /
      100;



    // SELLER FEE
    // Seller receives Quote Asset.
    // Therefore seller fee is calculated
    // from trade value.

    const sellerFeeAmount =
      tradeValue *
      sellerFeeRate /
      100;



    // =========================
    // MAKER / TAKER FEE AMOUNTS
    // =========================

    // Maker BUY
    // → fee is Base Asset

    // Maker SELL
    // → fee is Quote Asset

    const makerFeeAmount =
      makerIsBuyer
        ? buyerFeeAmount
        : sellerFeeAmount;



    // Taker BUY
    // → fee is Base Asset

    // Taker SELL
    // → fee is Quote Asset

    const takerFeeAmount =
      makerIsBuyer
        ? sellerFeeAmount
        : buyerFeeAmount;



    // =========================
    // CALCULATE SELLER TDS
    // =========================


    const tdsRate =
      Number(
        createTradeDto.tdsRate,
      );



    const tdsAmount =
      tradeValue *
      tdsRate /
      100;



    // =========================
    // FINAL AMOUNTS
    // =========================

    // Buyer pays only trade value
    // in Quote Asset (INR).
    //
    // Buyer fee is deducted from
    // Base Asset (BTC) received.

    const buyerTotalAmount =
      tradeValue;



    // Buyer receives executed quantity
    // minus buyer fee.

    const buyerSettlementQuantity =
      executedQuantity -
      buyerFeeAmount;



    if (
      buyerSettlementQuantity < 0
    ) {


      throw new BadRequestException(
        'Buyer settlement quantity cannot be negative',
      );


    }



    // Seller receives trade value
    // minus seller fee
    // minus TDS.

    const sellerSettlementAmount =
      tradeValue -
      sellerFeeAmount -
      tdsAmount;



    if (
      sellerSettlementAmount < 0
    ) {


      throw new BadRequestException(
        'Seller settlement amount cannot be negative',
      );


    }



    // =========================
    // TRADE TIME
    // =========================


    const tradeTime =
      createTradeDto.tradeTime
        ? new Date(createTradeDto.tradeTime)
        : new Date();



    // =========================
    // STATUS CODES
    // =========================


    const orderStatusCodes = {


      OPEN: 1,


      PARTIALLY_FILLED: 2,


      FILLED: 3,


      CANCELLED: 4,


    };



    // =========================
    // TRADE + TDS TRANSACTION
    // =========================


    const savedTrade =
      await this.dataSource.transaction(
        async (manager) => {


          // =========================
          // GET BUY / SELL ORDERS
          // =========================


          const orders =
            await manager.query(
              `
                SELECT
                  id,
                  userId,
                  tradingPairId,
                  orderQuantity,
                  side,
                  status
                FROM trade_order
                WHERE id IN (?, ?)
                FOR UPDATE
              `,
              [
                createTradeDto.buyOrderId,
                createTradeDto.sellOrderId,
              ],
            );



          if (
            !orders ||
            orders.length !== 2
          ) {


            throw new NotFoundException(
              'Buy or sell order not found',
            );


          }



          const buyOrder =
            orders.find(
              (order: any) =>
                Number(order.id) ===
                createTradeDto.buyOrderId,
            );



          const sellOrder =
            orders.find(
              (order: any) =>
                Number(order.id) ===
                createTradeDto.sellOrderId,
            );



          if (!buyOrder || !sellOrder) {


            throw new NotFoundException(
              'Buy or sell order not found',
            );


          }



          // =========================
          // VALIDATE ORDER SIDES
          // =========================


          if (
            buyOrder.side !== 'BUY'
          ) {


            throw new BadRequestException(
              'Buy order must have BUY side',
            );


          }



          if (
            sellOrder.side !== 'SELL'
          ) {


            throw new BadRequestException(
              'Sell order must have SELL side',
            );


          }



          // =========================
          // VALIDATE ORDER USERS
          // =========================


          if (
            Number(buyOrder.userId) !==
            buyer.id
          ) {


            throw new BadRequestException(
              'Buyer does not own the buy order',
            );


          }



          if (
            Number(sellOrder.userId) !==
            seller.id
          ) {


            throw new BadRequestException(
              'Seller does not own the sell order',
            );


          }



          // =========================
          // VALIDATE ORDER PAIRS
          // =========================


          if (
            Number(buyOrder.tradingPairId) !==
            tradingPair.id
          ) {


            throw new BadRequestException(
              'Buy order does not belong to the trading pair',
            );


          }



          if (
            Number(sellOrder.tradingPairId) !==
            tradingPair.id
          ) {


            throw new BadRequestException(
              'Sell order does not belong to the trading pair',
            );


          }



          // =========================
          // VALIDATE ORDER STATUS
          // =========================


          if (
            buyOrder.status === 'CANCELLED'
          ) {


            throw new BadRequestException(
              'Buy order is cancelled',
            );


          }



          if (
            sellOrder.status === 'CANCELLED'
          ) {


            throw new BadRequestException(
              'Sell order is cancelled',
            );


          }



          // =========================
          // GET PREVIOUS BUY FILLED
          // =========================


          const buyFilledResult =
            await manager.query(
              `
                SELECT
                  COALESCE(
                    SUM(executedQuantity),
                    0
                  ) AS filledQuantity
                FROM trade_settlement
                WHERE
                  buyOrderId = ?
                  OR sellOrderId = ?
              `,
              [
                createTradeDto.buyOrderId,
                createTradeDto.buyOrderId,
              ],
            );



          // =========================
          // GET PREVIOUS SELL FILLED
          // =========================


          const sellFilledResult =
            await manager.query(
              `
                SELECT
                  COALESCE(
                    SUM(executedQuantity),
                    0
                  ) AS filledQuantity
                FROM trade_settlement
                WHERE
                  buyOrderId = ?
                  OR sellOrderId = ?
              `,
              [
                createTradeDto.sellOrderId,
                createTradeDto.sellOrderId,
              ],
            );



          const previousBuyFilled =
            Number(
              buyFilledResult[0]?.filledQuantity || 0,
            );



          const previousSellFilled =
            Number(
              sellFilledResult[0]?.filledQuantity || 0,
            );



          // =========================
          // ORIGINAL QUANTITIES
          // =========================


          const buyOriginalQuantity =
            Number(
              buyOrder.orderQuantity,
            );



          const sellOriginalQuantity =
            Number(
              sellOrder.orderQuantity,
            );



          // =========================
          // REMAINING QUANTITIES
          // =========================


          const buyRemainingQuantity =
            buyOriginalQuantity -
            previousBuyFilled;



          const sellRemainingQuantity =
            sellOriginalQuantity -
            previousSellFilled;



          // =========================
          // VALIDATE EXECUTION
          // =========================


          if (
            executedQuantity >
            buyRemainingQuantity
          ) {


            throw new BadRequestException(
              'Executed quantity is greater than remaining buy quantity',
            );


          }



          if (
            executedQuantity >
            sellRemainingQuantity
          ) {


            throw new BadRequestException(
              'Executed quantity is greater than remaining sell quantity',
            );


          }



          // =========================
          // CALCULATE NEW FILLED
          // =========================


          const newBuyFilled =
            previousBuyFilled +
            executedQuantity;



          const newSellFilled =
            previousSellFilled +
            executedQuantity;



          // =========================
          // CALCULATE BUY STATUS
          // =========================


          let buyStatus:
            | 'OPEN'
            | 'PARTIALLY_FILLED'
            | 'FILLED';



          const EPSILON =
            0.000000000001;



          if (
            newBuyFilled >=
            buyOriginalQuantity - EPSILON
          ) {


            buyStatus = 'FILLED';


          }


          else if (
            newBuyFilled > 0
          ) {


            buyStatus =
              'PARTIALLY_FILLED';


          }


          else {


            buyStatus = 'OPEN';


          }



          // =========================
          // CALCULATE SELL STATUS
          // =========================


          let sellStatus:
            | 'OPEN'
            | 'PARTIALLY_FILLED'
            | 'FILLED';



          if (
            newSellFilled >=
            sellOriginalQuantity - EPSILON
          ) {


            sellStatus = 'FILLED';


          }


          else if (
            newSellFilled > 0
          ) {


            sellStatus =
              'PARTIALLY_FILLED';


          }


          else {


            sellStatus = 'OPEN';


          }



          // =========================
          // STATUS CODES
          // =========================


          const buyStatusCode =
            orderStatusCodes[
              buyStatus
            ];



          const sellStatusCode =
            orderStatusCodes[
              sellStatus
            ];



          // =========================
          // CREATE TRADE
          // =========================


          const tradeSettlement =
            this.tradeRepository.create({


              buyOrderId:
                createTradeDto.buyOrderId,


              sellOrderId:
                createTradeDto.sellOrderId,


              buyer,


              buyerId:
                buyer.id,


              seller,


              sellerId:
                seller.id,


              tradingPair,


              tradingPairId:
                tradingPair.id,


              tradingPairName:
                tradingPair.pairName,


              buyStatus,


              buyStatusCode,


              sellStatus,


              sellStatusCode,


              filledQuantity,


              makerOrderId:
                createTradeDto.makerOrderId,


              takerOrderId:
                createTradeDto.takerOrderId,


              executedPrice,


              executedQuantity,


              // Store fee RATES

              makerFee:
                makerFeeRate,


              takerFee:
                takerFeeRate,


              // Buyer pays only
              // the trade value.

              totalAmount:
                buyerTotalAmount,


              tradeTime,


              settlementStatus:
                'PENDING',


              settlementStatusCode:
                0,


            });



          // =========================
          // SAVE TRADE
          // =========================


          const savedTrade =
            await manager
              .getRepository(Trade)
              .save(
                tradeSettlement,
              );



          // =========================
          // UPDATE BUY ORDER STATUS
          // =========================


          await manager.query(
            `
              UPDATE trade_order
              SET status = ?
              WHERE id = ?
            `,
            [
              buyStatus,
              createTradeDto.buyOrderId,
            ],
          );



          // =========================
          // UPDATE SELL ORDER STATUS
          // =========================


          await manager.query(
            `
              UPDATE trade_order
              SET status = ?
              WHERE id = ?
            `,
            [
              sellStatus,
              createTradeDto.sellOrderId,
            ],
          );



          // =========================
          // CREATE SELLER TDS ONLY
          // =========================


          const sellerTds =
            this.tdsRepository.create({


              trade: savedTrade,


              tradeId:
                savedTrade.id,


              user: seller,


              userId:
                seller.id,


              tdsRate,


              tdsAmount,


            });



          // =========================
          // SAVE SELLER TDS
          // =========================


          await manager
            .getRepository(Tds)
            .save(
              sellerTds,
            );



          return savedTrade;


        },


      );



    // =========================
    // SETTLE TRADE
    // =========================


    await this.settlementService.createSettlement(
      savedTrade.id,
      buyerTotalAmount,
      buyerSettlementQuantity,
      sellerSettlementAmount,
    );



    savedTrade.settlementStatus = 'SETTLED';

    savedTrade.settlementStatusCode = 1;



    // =========================
    // SEND TRADE TO MARKET
    // =========================


    await this.marketService.processCompletedTrade(
      tradingPair.pairName,
      {

        price:
          executedPrice,


        quantity:
          executedQuantity,

      },

    );



    // =========================
    // RETURN TRADE
    // =========================


    return {


      message:
        'Trade created successfully',


      trade: {


        id:
          savedTrade.id,


        buyOrderId:
          savedTrade.buyOrderId,


        sellOrderId:
          savedTrade.sellOrderId,


        buyerId:
          savedTrade.buyerId,


        sellerId:
          savedTrade.sellerId,


        tradingPairId:
          savedTrade.tradingPairId,


        tradingPairName:
          savedTrade.tradingPairName,


        buyStatus:
          savedTrade.buyStatus,


        buyStatusCode:
          savedTrade.buyStatusCode,


        sellStatus:
          savedTrade.sellStatus,


        sellStatusCode:
          savedTrade.sellStatusCode,


        filledQuantity:
          savedTrade.filledQuantity,


        makerOrderId:
          savedTrade.makerOrderId,


        takerOrderId:
          savedTrade.takerOrderId,


        executedPrice:
          savedTrade.executedPrice,


        executedQuantity:
          savedTrade.executedQuantity,


        makerFee:
          savedTrade.makerFee,


        takerFee:
          savedTrade.takerFee,


        totalAmount:
          savedTrade.totalAmount,


        settlementStatus:
          savedTrade.settlementStatus,


        settlementStatusCode:
          savedTrade.settlementStatusCode,


        tradeTime:
          savedTrade.tradeTime,


      },



      maker: {


        userId:
          makerUser.id,


        orderId:
          createTradeDto.makerOrderId,


        feeRate:
          makerFeeRate,


        feeAmount:
          makerFeeAmount,


      },



      taker: {


        userId:
          takerUser.id,


        orderId:
          createTradeDto.takerOrderId,


        feeRate:
          takerFeeRate,


        feeAmount:
          takerFeeAmount,


      },



      buyer: {


        userId:
          buyer.id,


        feeRate:
          buyerFeeRate,


        feeAmount:
          buyerFeeAmount,


        totalAmount:
          buyerTotalAmount,


        settlementQuantity:
          buyerSettlementQuantity,


      },



      seller: {


        userId:
          seller.id,


        feeRate:
          sellerFeeRate,


        feeAmount:
          sellerFeeAmount,


        tradeValue,


        tdsRate,


        tdsAmount,


        settlementAmount:
          sellerSettlementAmount,


      },



      tds: {


        userId:
          seller.id,


        rate:
          tdsRate,


        amount:
          tdsAmount,


      },


    };


  }



  // =========================
  // GET TRADE
  // =========================


  async findTradeById(
    id: number,
  ) {


    const trade =
      await this.tradeRepository.findOne({


        where: {

          id,

        },


        relations: {

          buyer: true,

          seller: true,

          tradingPair: true,

        },


      });



    if (!trade) {


      throw new NotFoundException(
        'Trade not found',
      );


    }



    return trade;


  }



  // =========================
  // GET RECENT TRADES
  // =========================


  async findRecentTrades(
    tradingPairId: number,
  ) {


    return this.tradeRepository.find({


      where: {

        tradingPairId,

      },


      relations: {

        tradingPair: true,

      },


      order: {

        tradeTime: 'DESC',

      },


    });


  }



  // =========================
  // GET TRADE HISTORY
  // =========================


  async findTradeHistory(
    userId: number,
  ) {


    return this.tradeRepository.find({


      where: [

        {

          buyerId: userId,

        },


        {

          sellerId: userId,

        },


      ],


      relations: {

        buyer: true,

        seller: true,

        tradingPair: true,

      },


      order: {

        tradeTime: 'DESC',

      },


    });


  }


}