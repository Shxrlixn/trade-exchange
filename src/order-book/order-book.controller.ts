import {
  Controller,
  Delete,
  Get,
  Param,
} from '@nestjs/common';

import { OrderBookService } from './order-book.service';

@Controller('order-book')
export class OrderBookController {

  constructor(
    private readonly orderBookService: OrderBookService,
  ) {}

  /**
   * Get aggregated order book.
   *
   * Used by frontend.
   */
  @Get(':tradingPairId')
  getOrderBook(
    @Param('tradingPairId') tradingPairId: string,
  ) {

    return this.orderBookService.getOrderBook(
      Number(tradingPairId),
    );
  }

  /**
   * Get best BUY.
   *
   * Mainly for Matching Engine.
   */
  @Get(':tradingPairId/best-buy')
  getBestBuyOrder(
    @Param('tradingPairId') tradingPairId: string,
  ) {

    return this.orderBookService.getBestBuyOrder(
      Number(tradingPairId),
    );
  }

  /**
   * Get best SELL.
   *
   * Mainly for Matching Engine.
   */
  @Get(':tradingPairId/best-sell')
  getBestSellOrder(
    @Param('tradingPairId') tradingPairId: string,
  ) {

    return this.orderBookService.getBestSellOrder(
      Number(tradingPairId),
    );
  }

  /**
   * Remove order.
   *
   * Mainly for Order Service / Matching Engine.
   */
  @Delete(
    ':tradingPairId/order/:orderId',
  )
  removeOrder(
    @Param('tradingPairId') tradingPairId: string,
    @Param('orderId') orderId: string,
  ) {

    this.orderBookService.removeOrder(
      Number(tradingPairId),
      Number(orderId),
    );

    return {
      message:
        'Order removed from order book',
    };
  }
}