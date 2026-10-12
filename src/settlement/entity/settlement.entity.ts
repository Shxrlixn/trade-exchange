import {
  Entity,
  Column,
} from 'typeorm';

import {
  BaseEntity,
} from '../../common/entity/base.entity';


@Entity('settlement')
export class Settlement extends BaseEntity {

  // =========================
  // TRADE
  // =========================

  @Column({
    type: 'int',
    nullable: false,
  })
  tradeId!: number;


  // =========================
  // SETTLEMENT STATUS
  // =========================

  @Column({
    type: 'enum',
    enum: [
      'PENDING',
      'SETTLED',
      'FAILED',
    ],
    default: 'PENDING',
  })
  status!: string;


  // =========================
  // SETTLEMENT TIME
  // =========================

  @Column({
    type: 'datetime',
    nullable: true,
  })
  settlementTime!: Date | null;

}
