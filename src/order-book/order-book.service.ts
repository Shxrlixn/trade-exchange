import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import Decimal from 'decimal.js';

import { TradeOrder } from '../order/entity/trade-order.entity';
import { OrderBookResponseDto } from './dto/order-book-response.dto';
import { PriceLevelDto } from './dto/price-level.dto';

@Injectable()
export class OrderBookService {

  /**
   * One in-memory order book per trading pair.
   *
   * bids = BUY orders
   * asks = SELL orders
   *
   * Each order keeps its own remaining quantity.
   *
   * remainingQuantity is kept only in memory.
   */
  private orderBooks = new Map<
    number,
    {
      bids: {
        order: TradeOrder;
        remainingQuantity: Decimal;
      }[];

      asks: {
        order: TradeOrder;
        remainingQuantity: Decimal;
      }[];
    }
  >();


  // =========================================================
  // GET / CREATE ORDER BOOK
  // =========================================================

  private getOrCreateOrderBook(tradingPairId: number) {

    let orderBook = this.orderBooks.get(tradingPairId);

    if (!orderBook) {

      orderBook = {
        bids: [],
        asks: [],
      };

      this.orderBooks.set(
        tradingPairId,
        orderBook,
      );
    }

    return orderBook;
  }


  // =========================================================
  // ADD NEW ORDER
  // =========================================================

  /**
   * Add a new LIMIT order.
   *
   * This method uses the original order quantity.
   *
   * Used when a completely new order enters
   * the Order Book without being matched.
   */
  addOrder(order: TradeOrder): void {

    const orderBook =
      this.getOrCreateOrderBook(
        order.tradingPairId,
      );

    const orderEntry = {
      order,

      remainingQuantity:
        new Decimal(
          order.orderQuantity,
        ),
    };

    if (order.side === 'BUY') {

      orderBook.bids.push(
        orderEntry,
      );

      this.sortBids(
        orderBook.bids,
      );

    } else if (order.side === 'SELL') {

      orderBook.asks.push(
        orderEntry,
      );

      this.sortAsks(
        orderBook.asks,
      );
    }
  }


  // =========================================================
  // ADD ORDER WITH REMAINING QUANTITY
  // =========================================================

  /**
   * Add an order with a specific remaining quantity.
   *
   * Example:
   *
   * Original order = 10
   * Already executed = 3
   * Remaining = 7
   *
   * We add only 7 to the Order Book.
   */
  addOrderWithRemaining(
    order: TradeOrder,
    remainingQuantity: Decimal,
  ): void {

    if (
      remainingQuantity.lessThanOrEqualTo(0)
    ) {
      return;
    }

    const orderBook =
      this.getOrCreateOrderBook(
        order.tradingPairId,
      );

    const orderEntry = {
      order,

      remainingQuantity:
        new Decimal(
          remainingQuantity,
        ),
    };

    if (order.side === 'BUY') {

      orderBook.bids.push(
        orderEntry,
      );

      this.sortBids(
        orderBook.bids,
      );

    } else if (order.side === 'SELL') {

      orderBook.asks.push(
        orderEntry,
      );

      this.sortAsks(
        orderBook.asks,
      );
    }
  }


  // =========================================================
  // SORT BUY ORDERS
  // =========================================================

  /**
   * BUY priority:
   *
   * 1. Highest price first
   * 2. Same price → oldest first
   */
  private sortBids(
    orders: {
      order: TradeOrder;
      remainingQuantity: Decimal;
    }[],
  ): void {

    orders.sort((a, b) => {

      const priceA =
        new Decimal(
          a.order.orderPrice!,
        );

      const priceB =
        new Decimal(
          b.order.orderPrice!,
        );

      /**
       * Higher BUY price gets priority.
       */
      if (!priceA.equals(priceB)) {

        return priceB
          .minus(priceA)
          .toNumber();
      }

      /**
       * Same price → FIFO.
       */
      return (
        new Date(
          a.order.orderPlacedAt,
        ).getTime()
        -
        new Date(
          b.order.orderPlacedAt,
        ).getTime()
      );
    });
  }


  // =========================================================
  // SORT SELL ORDERS
  // =========================================================

  /**
   * SELL priority:
   *
   * 1. Lowest price first
   * 2. Same price → oldest first
   */
  private sortAsks(
    orders: {
      order: TradeOrder;
      remainingQuantity: Decimal;
    }[],
  ): void {

    orders.sort((a, b) => {

      const priceA =
        new Decimal(
          a.order.orderPrice!,
        );

      const priceB =
        new Decimal(
          b.order.orderPrice!,
        );

      /**
       * Lower SELL price gets priority.
       */
      if (!priceA.equals(priceB)) {

        return priceA
          .minus(priceB)
          .toNumber();
      }

      /**
       * Same price → FIFO.
       */
      return (
        new Date(
          a.order.orderPlacedAt,
        ).getTime()
        -
        new Date(
          b.order.orderPlacedAt,
        ).getTime()
      );
    });
  }


  // =========================================================
  // BEST BUY
  // =========================================================

  /**
   * Get the best BUY order.
   *
   * Highest BUY price.
   */
  getBestBuyOrder(
    tradingPairId: number,
  ): TradeOrder | null {

    const orderBook =
      this.orderBooks.get(
        tradingPairId,
      );

    if (
      !orderBook ||
      orderBook.bids.length === 0
    ) {

      return null;
    }

    return orderBook.bids[0].order;
  }


  // =========================================================
  // BEST SELL
  // =========================================================

  /**
   * Get the best SELL order.
   *
   * Lowest SELL price.
   */
  getBestSellOrder(
    tradingPairId: number,
  ): TradeOrder | null {

    const orderBook =
      this.orderBooks.get(
        tradingPairId,
      );

    if (
      !orderBook ||
      orderBook.asks.length === 0
    ) {

      return null;
    }

    return orderBook.asks[0].order;
  }


  // =========================================================
  // BEST BUY - SELF TRADE PREVENTION
  // =========================================================

  /**
   * Get the best BUY order that does not
   * belong to the incoming user's account.
   *
   * Used when incoming order is SELL.
   */
  getBestBuyOrderForUser(
    tradingPairId: number,
    userId: number,
  ): TradeOrder | null {

    const orderBook =
      this.orderBooks.get(
        tradingPairId,
      );

    if (
      !orderBook ||
      orderBook.bids.length === 0
    ) {

      return null;
    }

    const entry =
      orderBook.bids.find(
        entry =>
          entry.order.userId !== userId &&
          entry.remainingQuantity.greaterThan(0),
      );

    return entry?.order ?? null;
  }


  // =========================================================
  // BEST SELL - SELF TRADE PREVENTION
  // =========================================================

  /**
   * Get the best SELL order that does not
   * belong to the incoming user's account.
   *
   * Used when incoming order is BUY.
   */
  getBestSellOrderForUser(
    tradingPairId: number,
    userId: number,
  ): TradeOrder | null {

    const orderBook =
      this.orderBooks.get(
        tradingPairId,
      );

    if (
      !orderBook ||
      orderBook.asks.length === 0
    ) {

      return null;
    }

    const entry =
      orderBook.asks.find(
        entry =>
          entry.order.userId !== userId &&
          entry.remainingQuantity.greaterThan(0),
      );

    return entry?.order ?? null;
  }


  // =========================================================
  // GET REMAINING QUANTITY
  // =========================================================

  /**
   * Get remaining quantity of
   * a specific order.
   */
  getRemainingQuantity(
    tradingPairId: number,
    orderId: number,
  ): Decimal {

    const orderBook =
      this.orderBooks.get(
        tradingPairId,
      );

    if (!orderBook) {

      throw new NotFoundException(
        'Order book not found',
      );
    }

    const bid =
      orderBook.bids.find(
        entry =>
          entry.order.id === orderId,
      );

    if (bid) {

      return bid.remainingQuantity;
    }

    const ask =
      orderBook.asks.find(
        entry =>
          entry.order.id === orderId,
      );

    if (ask) {

      return ask.remainingQuantity;
    }

    throw new NotFoundException(
      'Order not found in order book',
    );
  }


  // =========================================================
  // UPDATE REMAINING QUANTITY
  // =========================================================

  /**
   * Update remaining quantity
   * after a trade execution.
   *
   * Example:
   *
   * Original quantity = 10
   * Executed quantity = 3
   * Remaining quantity = 7
   */
  updateRemainingQuantity(
    tradingPairId: number,
    orderId: number,
    executedQuantity: Decimal,
  ): void {

    const orderBook =
      this.orderBooks.get(
        tradingPairId,
      );

    if (!orderBook) {

      throw new NotFoundException(
        'Order book not found',
      );
    }

    const bid =
      orderBook.bids.find(
        entry =>
          entry.order.id === orderId,
      );

    const ask =
      orderBook.asks.find(
        entry =>
          entry.order.id === orderId,
      );

    const entry =
      bid ?? ask;

    if (!entry) {

      throw new NotFoundException(
        'Order not found in order book',
      );
    }

    /**
     * Prevent invalid execution.
     */
    if (
      executedQuantity.lessThanOrEqualTo(0)
    ) {

      throw new Error(
        'Executed quantity must be greater than zero',
      );
    }

    /**
     * Make sure we never execute
     * more than the remaining quantity.
     */
    if (
      executedQuantity.greaterThan(
        entry.remainingQuantity,
      )
    ) {

      throw new Error(
        'Executed quantity exceeds remaining quantity',
      );
    }

    /**
     * Reduce remaining quantity.
     */
    entry.remainingQuantity =
      entry.remainingQuantity.minus(
        executedQuantity,
      );

    /**
     * Fully filled order.
     */
    if (
      entry.remainingQuantity.lessThanOrEqualTo(0)
    ) {

      entry.remainingQuantity =
        new Decimal(0);

      this.removeOrder(
        tradingPairId,
        orderId,
      );
    }
  }


  // =========================================================
  // REMOVE ORDER
  // =========================================================

  /**
   * Remove an order from the
   * in-memory order book.
   */
  removeOrder(
    tradingPairId: number,
    orderId: number,
  ): void {

    const orderBook =
      this.orderBooks.get(
        tradingPairId,
      );

    if (!orderBook) {

      throw new NotFoundException(
        'Order book not found',
      );
    }

    orderBook.bids =
      orderBook.bids.filter(
        entry =>
          entry.order.id !== orderId,
      );

    orderBook.asks =
      orderBook.asks.filter(
        entry =>
          entry.order.id !== orderId,
      );
  }


  // =========================================================
  // GET ORDER BOOK
  // =========================================================

  /**
   * Get complete order book.
   *
   * Internally:
   * individual orders.
   *
   * API:
   * aggregated price levels.
   */
  getOrderBook(
    tradingPairId: number,
  ): OrderBookResponseDto {

    const orderBook =
      this.orderBooks.get(
        tradingPairId,
      );

    if (!orderBook) {

      return {
        tradingPairId,
        bids: [],
        asks: [],
      };
    }

    return {

      tradingPairId,

      bids:
        this.aggregatePriceLevels(
          orderBook.bids,
          true,
        ),

      asks:
        this.aggregatePriceLevels(
          orderBook.asks,
          false,
        ),
    };
  }


  // =========================================================
  // AGGREGATE PRICE LEVELS
  // =========================================================

  /**
   * Aggregate orders having
   * the same price.
   *
   * This is only for API response.
   */
  private aggregatePriceLevels(
    orders: {
      order: TradeOrder;
      remainingQuantity: Decimal;
    }[],
    isBuy: boolean,
  ): PriceLevelDto[] {

    const priceMap =
      new Map<string, Decimal>();

    for (const entry of orders) {

      /**
       * Ignore completely filled orders.
       */
      if (
        entry.remainingQuantity.lessThanOrEqualTo(0)
      ) {

        continue;
      }

      const price =
        new Decimal(
          entry.order.orderPrice!,
        );

      const priceKey =
        price.toFixed();

      const existingQuantity =
        priceMap.get(priceKey)
        ?? new Decimal(0);

      priceMap.set(
        priceKey,
        existingQuantity.plus(
          entry.remainingQuantity,
        ),
      );
    }

    const priceLevels =
      Array.from(
        priceMap.entries(),
      ).map(
        ([price, amount]) => {

          const priceDecimal =
            new Decimal(price);

          const total =
            priceDecimal.times(
              amount,
            );

          return {

            price,

            amount:
              amount.toFixed(),

            total:
              total.toFixed(),

          };
        },
      );

    /**
     * BUY → highest price first.
     *
     * SELL → lowest price first.
     */
    priceLevels.sort(
      (a, b) => {

        const difference =
          new Decimal(a.price)
            .minus(
              new Decimal(b.price),
            )
            .toNumber();

        return isBuy
          ? -difference
          : difference;
      },
    );

    return priceLevels;
  }


  // =========================================================
  // GET INDIVIDUAL BUY ORDERS
  // =========================================================

  /**
   * Get individual BUY orders.
   *
   * Used internally by the
   * Matching Engine.
   */
  getBids(
    tradingPairId: number,
  ) {

    return (
      this.orderBooks.get(
        tradingPairId,
      )?.bids ?? []
    );
  }


  // =========================================================
  // GET INDIVIDUAL SELL ORDERS
  // =========================================================

  /**
   * Get individual SELL orders.
   *
   * Used internally by the
   * Matching Engine.
   */
  getAsks(
    tradingPairId: number,
  ) {

    return (
      this.orderBooks.get(
        tradingPairId,
      )?.asks ?? []
    );
  }
}