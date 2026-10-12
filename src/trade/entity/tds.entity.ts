import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { BaseEntity } from '../../common/entity/base.entity';

import { Trade } from './trade.entity';

import { User } from '../../user/entity/user.entity';


@Entity('tds')
export class Tds extends BaseEntity {

  // =========================
  // TRADE
  // =========================

  @ManyToOne(
    () => Trade,
    {
      nullable: false,
    },
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
    {
      nullable: false,
    },
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
  // TDS RATE
  // =========================

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: false,
  })
  tdsRate!: number;


  // =========================
  // TDS AMOUNT
  // =========================

  @Column({
    type: 'decimal',
    precision: 30,
    scale: 18,
    default: 0,
  })
  tdsAmount!: number;

}