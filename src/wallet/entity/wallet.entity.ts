import {
  Entity,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { BaseEntity } from '../../common/entity/base.entity';
import { User } from '../../user/entity/user.entity';
import { WalletBalance } from './wallet-balance.entity';

@Entity('wallet')
export class Wallet extends BaseEntity {

  // =========================
  // USER
  // =========================

  @OneToOne(
    () => User,
    (user) => user.wallet,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'userId' })
  user!: User;

  // =========================
  // BALANCES
  // =========================

  @OneToMany(
    () => WalletBalance,
    (walletBalance) => walletBalance.wallet,
    {
      cascade: true,
    },
  )
  balances!: WalletBalance[];
}