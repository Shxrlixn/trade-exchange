import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { BaseEntity } from '../../common/entity/base.entity';
import { TradingPair } from './trading-pair.entity';

@Entity('market_ticker')
export class MarketTicker extends BaseEntity {

  @OneToOne(() => TradingPair, { nullable: false })
  @JoinColumn({ name: 'tradingPairId' })
  tradingPair!: TradingPair;

  @Column({
    type: 'int',
    nullable: false,
    unique: true,
  })
  tradingPairId!: number;

  @Column({
    type: 'decimal',
    precision: 30,
    scale: 18,
    default: 0,
  })
  currentPrice!: number;

  @Column({
    type: 'decimal',
    precision: 30,
    scale: 18,
    default: 0,
  })
  change24h!: number;

  @Column({
    type: 'decimal',
    precision: 30,
    scale: 18,
    default: 0,
  })
  high24h!: number;

  @Column({
    type: 'decimal',
    precision: 30,
    scale: 18,
    default: 0,
  })
  low24h!: number;

  @Column({
    type: 'decimal',
    precision: 30,
    scale: 18,
    default: 0,
  })
  volume24h!: number;
}