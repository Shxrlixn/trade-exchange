import {

  Entity,

  Column,

  ManyToOne,

  JoinColumn,

} from 'typeorm';

import { BaseEntity } from '../../common/entity/base.entity';

import { User } from '../../user/entity/user.entity';

import { Currency } from '../../currency/entity/currency.entity';

export enum DepositStatus {

  CONFIRMED = 'CONFIRMED',

  REJECTED = 'REJECTED',

}

@Entity('deposit')

export class Deposit extends BaseEntity {

  // =========================
  // DEPOSIT NUMBER
  // =========================

  @Column({

    unique: true,

    length: 20,

    nullable: true,

  })

  depositNumber!: string;

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
  // DEPOSIT STATUS
  // =========================

  @Column({

    type: 'enum',

    enum: DepositStatus,

    nullable: true,

  })

  status!: DepositStatus | null;

  // =========================
  // DEPOSIT STATUS CODE
  // =========================

  @Column({

    type: 'int',

    nullable: true,

  })

  statusCode!: number | null;

  // =========================
  // USER
  // =========================

  @Column()

  userId!: number;

  // =========================
  // CURRENCY
  // =========================

  @Column()

  currencyId!: number;

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
  // DEPOSIT → USER
  // =========================

  @ManyToOne(() => User, {

    nullable: false,

  })

  @JoinColumn({ name: 'userId' })

  user!: User;

  // =========================
  // DEPOSIT → CURRENCY
  // =========================

  @ManyToOne(() => Currency, {

    nullable: false,

  })

  @JoinColumn({ name: 'currencyId' })

  currency!: Currency;

}