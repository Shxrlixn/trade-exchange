import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import {
  BaseEntity,
} from '../../common/entity/base.entity';

import {
  User,
} from '../../user/entity/user.entity';

import {
  TradingPair,
} from '../../market/entity/trading-pair.entity';

import {
  Trade,
} from './trade.entity';


@Entity('trade_history')
export class TradeHistory extends BaseEntity {

  // =========================
  // TRADE
  // =========================

  @ManyToOne(
    () => Trade,
    { nullable: false },
  )
  @JoinColumn({
    name: 'tradeId',
  })
  trade!: Trade;

  @Column({
    type: 'int',
    nullable: false,
  })
  tradeId!: number;


  // =========================
  // USER
  // =========================

  @ManyToOne(
    () => User,
    { nullable: false },
  )
  @JoinColumn({
    name: 'userId',
  })
  user!: User;

  @Column({
    type: 'int',
    nullable: false,
  })
  userId!: number;


  // =========================
  // TRADING PAIR
  // =========================

  @ManyToOne(
    () => TradingPair,
    { nullable: false },
  )
  @JoinColumn({
    name: 'tradingPairId',
  })
  tradingPair!: TradingPair;

  @Column({
    type: 'int',
    nullable: false,
  })
  tradingPairId!: number;


  // =========================
  // SIDE
  // =========================

  @Column({
    type: 'enum',
    enum: ['BUY', 'SELL'],
    nullable: false,
  })
  side!: string;


  // =========================
  // EXECUTED PRICE
  // =========================

  @Column({
    type: 'decimal',
    precision: 30,
    scale: 18,
    nullable: false,
  })
  executedPrice!: number;


  // =========================
  // FILLED QUANTITY
  // =========================

  @Column({
    type: 'decimal',
    precision: 30,
    scale: 18,
    nullable: false,
  })
  filledQuantity!: number;


  // =========================
  // TOTAL AMOUNT
  // =========================

  @Column({
    type: 'decimal',
    precision: 30,
    scale: 18,
    nullable: false,
  })
  totalAmount!: number;


  // =========================
  // TOTAL FEES
  // =========================

  @Column({
    type: 'decimal',
    precision: 30,
    scale: 18,
    default: 0,
  })
  totalFees!: number;


  // =========================
  // TRADE TIME
  // =========================

  @Column({
    type: 'datetime',
    nullable: false,
  })
  tradeTime!: Date;

}