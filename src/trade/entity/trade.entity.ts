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


@Entity('trade_settlement')
export class Trade extends BaseEntity {

  @Column({ type: 'int', nullable: false })
  buyOrderId!: number;

  @Column({ type: 'int', nullable: false })
  sellOrderId!: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'buyerId' })
  buyer!: User;

  @Column({ type: 'int', nullable: false })
  buyerId!: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'sellerId' })
  seller!: User;

  @Column({ type: 'int', nullable: false })
  sellerId!: number;

  @ManyToOne(() => TradingPair, { nullable: false })
  @JoinColumn({ name: 'tradingPairId' })
  tradingPair!: TradingPair;

  @Column({ type: 'int', nullable: false })
  tradingPairId!: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  tradingPairName!: string;

  @Column({
    type: 'enum',
    enum: [
      'OPEN',
      'PARTIALLY_FILLED',
      'FILLED',
      'CANCELLED',
    ],
    default: 'OPEN',
  })
  buyStatus!: string;

  @Column({
    type: 'tinyint',
    nullable: false,
    default: 1,
  })
  buyStatusCode!: number;

  @Column({
    type: 'enum',
    enum: [
      'OPEN',
      'PARTIALLY_FILLED',
      'FILLED',
      'CANCELLED',
    ],
    default: 'OPEN',
  })
  sellStatus!: string;

  @Column({
    type: 'tinyint',
    nullable: false,
    default: 1,
  })
  sellStatusCode!: number;

  @Column({
    type: 'decimal',
    precision: 30,
    scale: 18,
    default: 0,
  })
  filledQuantity!: number;

  @Column({ type: 'int', nullable: false })
  makerOrderId!: number;

  @Column({ type: 'int', nullable: false })
  takerOrderId!: number;

  @Column({
    type: 'decimal',
    precision: 30,
    scale: 18,
    nullable: false,
  })
  executedPrice!: number;

  @Column({
    type: 'decimal',
    precision: 30,
    scale: 18,
    nullable: false,
  })
  executedQuantity!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 6,
    default: 0,
  })
  makerFee!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 6,
    default: 0,
  })
  takerFee!: number;

  @Column({
    type: 'decimal',
    precision: 30,
    scale: 18,
    nullable: false,
  })
  totalAmount!: number;

  @Column({
    type: 'datetime',
    nullable: false,
  })
  tradeTime!: Date;

  @Column({
    type: 'enum',
    enum: [
      'PENDING',
      'SETTLED',
      'FAILED',
    ],
    default: 'PENDING',
  })
  settlementStatus!: string;

  @Column({
    type: 'tinyint',
    nullable: false,
    default: 0,
  })
  settlementStatusCode!: number;
}