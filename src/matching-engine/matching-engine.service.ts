import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { TradeOrder } from '../order/entity/trade-order.entity';
import { OrderBookService } from '../order-book/order-book.service';
import { TradeService } from '../trade/trade.service';
import { CreateTradeDto } from '../trade/dto/create-trade.dto';

import Decimal from 'decimal.js';

@Injectable()
export class MatchingEngineService {

  constructor(
    private readonly orderBookService: OrderBookService,
    private readonly tradeService: TradeService,
  ) {}

  async processOrder(incomingOrder: TradeOrder): Promise<void> {

    let incomingRemaining = new Decimal(
      incomingOrder.orderQuantity,
    );

    while (incomingRemaining.greaterThan(0)) {

      // 1. Find best opposite order
      const makerOrder =
        incomingOrder.side === 'BUY'
          ? this.orderBookService.getBestSellOrderForUser(
              incomingOrder.tradingPairId,
              incomingOrder.userId,
            )
          : this.orderBookService.getBestBuyOrderForUser(
              incomingOrder.tradingPairId,
              incomingOrder.userId,
            );

      // No opposite order available
      if (!makerOrder) {
        break;
      }

      // 2. Get maker remaining quantity
      const makerRemaining =
        this.orderBookService.getRemainingQuantity(
          incomingOrder.tradingPairId,
          makerOrder.id,
        );

      if (!makerRemaining || makerRemaining.lessThanOrEqualTo(0)) {
        this.orderBookService.removeOrder(
          incomingOrder.tradingPairId,
          makerOrder.id,
        );
        continue;
      }

      // 3. Check price compatibility
      if (
        incomingOrder.orderType === 'LIMIT' &&
        !this.isPriceCompatible(incomingOrder, makerOrder)
      ) {
        break;
      }

      // 4. Calculate execution quantity
      const executedQuantity = Decimal.min(
        incomingRemaining,
        makerRemaining,
      );

      // 5. Determine maker/taker
      const makerOrderId = makerOrder.id;
      const takerOrderId = incomingOrder.id;

      // 6. Execution price = maker price
      const executedPrice = new Decimal(
        makerOrder.orderPrice!,
      );

      const buyOrder =
        incomingOrder.side === 'BUY'
          ? incomingOrder
          : makerOrder;

      const sellOrder =
        incomingOrder.side === 'SELL'
          ? incomingOrder
          : makerOrder;

      // 7. Create trade through EXISTING Trade Service
      const tradeDto: CreateTradeDto = {
        buyOrderId: buyOrder.id,
        sellOrderId: sellOrder.id,

        buyerId: buyOrder.userId,
        sellerId: sellOrder.userId,

        tradingPairId: incomingOrder.tradingPairId,

        executedPrice: executedPrice.toNumber(),
        executedQuantity: executedQuantity.toNumber(),

        makerOrderId,
        takerOrderId,

        // Current TDS configuration
        tdsRate: 1,
      };

      await this.tradeService.createTrade(tradeDto);

      // 8. Update incoming remaining quantity
      incomingRemaining = incomingRemaining.minus(
        executedQuantity,
      );

      // 9. Update maker remaining quantity
      this.orderBookService.updateRemainingQuantity(
        incomingOrder.tradingPairId,
        makerOrder.id,
        executedQuantity,
      );

      // 10. If maker is completely filled,
      // OrderBookService removes it automatically.
    }

    // 11. Remaining LIMIT quantity goes into Order Book
    if (
      incomingOrder.orderType === 'LIMIT' &&
      incomingRemaining.greaterThan(0)
    ) {
      this.orderBookService.addOrderWithRemaining(
        incomingOrder,
        incomingRemaining,
      );
    }

    // MARKET orders do NOT enter the Order Book.
  }

  private isPriceCompatible(
    incomingOrder: TradeOrder,
    makerOrder: TradeOrder,
  ): boolean {

    if (incomingOrder.orderPrice === null) {
      return true;
    }

    const incomingPrice = new Decimal(
      incomingOrder.orderPrice,
    );

    const makerPrice = new Decimal(
      makerOrder.orderPrice!,
    );

    // BUY can match SELL when BUY >= SELL
    if (incomingOrder.side === 'BUY') {
      return incomingPrice.greaterThanOrEqualTo(makerPrice);
    }

    // SELL can match BUY when SELL <= BUY
    return incomingPrice.lessThanOrEqualTo(makerPrice);
  }
}