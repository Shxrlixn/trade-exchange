import {

  Entity,

  Column,

  ManyToOne,

  JoinColumn,

} from 'typeorm';

import { BaseEntity } from '../../common/entity/base.entity';

import { User } from '../../user/entity/user.entity';

import { Currency } from '../../currency/entity/currency.entity';

export enum TransactionType {

  DEPOSIT = 'DEPOSIT',

  WITHDRAWAL = 'WITHDRAWAL',

}

export enum TransactionStatus {

  CONFIRMED = 'CONFIRMED',

  REJECTED = 'REJECTED',

}

@Entity('transactions')

export class Transaction extends BaseEntity {

  // =========================

  // TRANSACTION ID

  // =========================

  @Column({

    unique: true,

    length: 100,

  })

  transactionId!: string;

  // =========================

  // TRANSACTION TYPE

  // =========================

  @Column({

    type: 'enum',

    enum: TransactionType,

  })

  type!: TransactionType;

  // =========================

  // TRANSACTION STATUS

  // =========================

  @Column({

    type: 'enum',

    enum: TransactionStatus,

    nullable: true,

  })

  status!: TransactionStatus | null;

  // =========================

  // TRANSACTION STATUS CODE

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

  @ManyToOne(() => User, {

    nullable: false,

  })

  @JoinColumn({ name: 'userId' })

  user!: User;

  // =========================

  // CURRENCY

  // =========================

  @Column()

  currencyId!: number;

  @ManyToOne(() => Currency, {

    nullable: false,

  })

  @JoinColumn({ name: 'currencyId' })

  currency!: Currency;

  // =========================

  // AMOUNT

  // =========================

  @Column('decimal', {

    precision: 30,

    scale: 18,

  })

  amount!: number;

  // =========================

  // REFERENCE ID

  // =========================

  @Column({

    type: 'int',

    nullable: true,

  })

  referenceId!: number | null;

}