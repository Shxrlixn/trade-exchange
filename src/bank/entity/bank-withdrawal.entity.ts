import {
  Entity,
  Column,
} from 'typeorm';

import {
  BaseEntity,
} from '../../common/entity/base.entity';

// =========================
// BANK WITHDRAWAL STATUS
// =========================

export enum BankWithdrawalStatus {
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
}

@Entity('withdrawal')
export class BankWithdrawal extends BaseEntity {

  // =========================
  // WITHDRAWAL NUMBER
  // =========================

  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
    nullable: false,
  })
  withdrawalNumber!: string;

  // =========================
  // USER ID
  // =========================

  @Column({
    type: 'int',
    nullable: false,
  })
  userId!: number;

  // =========================
  // TRANSACTION ID
  // =========================

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: false,
  })
  transactionId!: string;

  // =========================
  // CURRENCY ID
  // =========================

  @Column({
    type: 'int',
    nullable: false,
  })
  currencyId!: number;

  // =========================
  // CURRENCY NAME
  // =========================

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  currencyName!: string;

  // =========================
  // AMOUNT
  // =========================

  @Column('decimal', {
    precision: 12,
    scale: 2,
    nullable: false,
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
  status!: BankWithdrawalStatus | null;

  // =========================
  // STATUS CODE
  // =========================
  // 10 = CONFIRMED
  // 20 = REJECTED

  @Column({
    type: 'int',
    nullable: true,
  })
  statusCode!: number | null;
}