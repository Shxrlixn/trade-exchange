import {
  Entity,
  Column,
  OneToOne,
} from 'typeorm';

import { BaseEntity } from '../../common/entity/base.entity';
import { Wallet } from '../../wallet/entity/wallet.entity';

@Entity('users')
export class User extends BaseEntity {

  @Column({ length: 100 })
  name!: string;

  @Column({ unique: true, length: 150 })
  email!: string;

  @Column({ length: 255, select: false })
  password!: string;

  @Column({ unique: true, length: 10 })
  phone!: string;

  @Column({ length: 255 })
  address!: string;

  @Column({ type: 'date' })
  dateOfBirth!: Date;

  @Column({
    type: 'enum',
    enum: ['Male', 'Female', 'Other'],
  })
  gender!: string;

  // =========================
  // USER → WALLET
  // =========================

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  wallet!: Wallet;
}