import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { BaseEntity } from '../../common/entity/base.entity';

import { User } from '../../user/entity/user.entity';

import { TradingPair } from '../../market/entity/trading-pair.entity';


@Entity('trade_order')
export class TradeOrder extends BaseEntity {


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


  @Column({
    type: 'decimal',
    precision: 30,
    scale: 18,
    nullable: true,
  })
  orderPrice!: number | null;


  @Column({
    type: 'decimal',
    precision: 30,
    scale: 18,
    nullable: false,
  })
  orderQuantity!: number;


  @Column({
    type: 'decimal',
    precision: 30,
    scale: 18,
    default: 0,
  })
  orderValue!: number;


  @Column({
    type: 'enum',
    enum: ['BUY', 'SELL'],
    nullable: false,
  })
  side!: string;


  @Column({
    type: 'enum',
    enum: ['LIMIT', 'MARKET'],
    nullable: false,
  })
  orderType!: string;


  @Column({
    type: 'enum',
    enum: [
      'OPEN',
      'PARTIALLY_FILLED',
      'FILLED',
      'PARTIALLY_CANCELLED',
      'CANCELLED',
    ],
    default: 'OPEN',
  })
  status!: string;


  @Column({
    type: 'int',
    default: 1,
  })
  statusCode!: number;


  @Column({
    type: 'datetime',
    nullable: false,
  })
  orderPlacedAt!: Date;

}