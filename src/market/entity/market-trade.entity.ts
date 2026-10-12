import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { BaseEntity } from '../../common/entity/base.entity';
import { TradingPair } from './trading-pair.entity';

@Entity('market_trade')
export class MarketTrade extends BaseEntity {

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
    nullable: false,
  })
  price!: number;

  @Column({
    type: 'decimal',
    precision: 30,
    scale: 18,
    nullable: false,
  })
  quantity!: number;

  @Column({
    type: 'datetime',
    nullable: false,
  })
  tradeTime!: Date;
}