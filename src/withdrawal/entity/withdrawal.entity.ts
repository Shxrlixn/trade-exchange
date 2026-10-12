import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { BaseEntity } from '../../common/entity/base.entity';

import { User } from '../../user/entity/user.entity';

import { Currency } from '../../currency/entity/currency.entity';

// =========================
// WITHDRAWAL STATUS
// =========================

export enum WithdrawalStatus {

  CONFIRMED = 'CONFIRMED',

  REJECTED = 'REJECTED',

}

@Entity('withdrawal')
export class Withdrawal extends BaseEntity {

  // =========================
  // WITHDRAWAL NUMBER
  // =========================

  @Column({
  type: 'varchar',
  length: 20,
  unique: true,
  nullable: true,
})
withdrawalNumber!: string | null;

  // =========================
  // USER ID
  // =========================

  @Column({
    type: 'int',
  })
  userId!: number;

  // =========================
  // TRANSACTION ID
  // =========================

@Column({
  type: 'varchar',
  length: 100,
  unique: true,
  nullable: true,
})
transactionId!: string | null;

  // =========================
  // CURRENCY ID
  // =========================

  @Column({
    type: 'int',
  })
  currencyId!: number;

  // =========================
  // CURRENCY NAME
  // =========================

  @Column({
    length: 100,
  })
  currencyName!: string;

  // =========================
  // AMOUNT
  // =========================

  @Column('decimal', {
    precision: 12,
    scale: 2,
  })
  amount!: number;

  // =========================
  // STATUS
  // =========================

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  status!: WithdrawalStatus | null;

  // =========================
  // STATUS CODE
  // =========================
  //
  // 10 = CONFIRMED
  // 20 = REJECTED
  //
  // =========================

  @Column({
    type: 'int',
    nullable: true,
  })
  statusCode!: number | null;

  // =========================
  // WITHDRAWAL → USER
  // =========================

  @ManyToOne(() => User, {
    nullable: false,
  })
  @JoinColumn({
    name: 'userId',
  })
  user!: User;

  // =========================
  // WITHDRAWAL → CURRENCY
  // =========================

  @ManyToOne(() => Currency, {
    nullable: false,
  })
  @JoinColumn({
    name: 'currencyId',
  })
  currency!: Currency;

}