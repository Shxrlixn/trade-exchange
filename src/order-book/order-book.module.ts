import { Module } from '@nestjs/common';

import { OrderBookController } from './order-book.controller';
import { OrderBookService } from './order-book.service';

@Module({
  controllers: [
    OrderBookController,
  ],

  providers: [
    OrderBookService,
  ],

  exports: [
    OrderBookService,
  ],
})
export class OrderBookModule {}