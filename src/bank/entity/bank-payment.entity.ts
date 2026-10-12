import {

  Entity,

  Column,

} from 'typeorm';

import { BaseEntity } from '../../common/entity/base.entity';

export enum BankPaymentStatus {

  CONFIRMED = 'CONFIRMED',

  REJECTED = 'REJECTED',

}

@Entity('bank')

export class BankPayment extends BaseEntity {

  // =========================
  // BANK PAYMENT ID
  // =========================

  @Column({

    unique: true,

    length: 100,

  })
  paymentId!: string;

  // =========================
  // USER ID
  // =========================
  //
  // Internal User Service ID
  // stored with the payment.
  // =========================

  @Column({

    type: 'int',

  })
  userId!: number;

  // =========================
  // USER SERVICE TRANSACTION ID
  // =========================

  @Column({

    unique: true,

    length: 100,

  })
  transactionId!: string;

  // =========================
  // PAYMENT AMOUNT
  // =========================

  @Column('decimal', {

    precision: 30,

    scale: 18,

  })
  amount!: number;

  // =========================
  // BANK PAYMENT RESULT
  // =========================

  @Column({

    type: 'enum',

    enum: BankPaymentStatus,

    nullable: true,

  })
  status!: BankPaymentStatus | null;

  // =========================
  // BANK PAYMENT STATUS CODE
  // =========================
  //
  // 10 = CONFIRMED
  // 20 = REJECTED
  // =========================

  @Column({

    type: 'int',

    nullable: true,

  })
  statusCode!: number | null;

}