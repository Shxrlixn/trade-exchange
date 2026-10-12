import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

import { BaseEntity } from '../../common/entity/base.entity';
import { Wallet } from './wallet.entity';
import { Currency } from '../../currency/entity/currency.entity';

@Entity('wallet_balance')
@Unique(['wallet', 'currency'])
export class WalletBalance extends BaseEntity {

  // =========================
  // AVAILABLE BALANCE
  // =========================

  @Column('decimal', {
    precision: 30,
    scale: 18,
    default: 0,
  })
  availableBalance!: number;

  // =========================
  // CURRENCY
  // =========================

  @ManyToOne(
    () => Currency,
    {
      nullable: false,
    },
  )
  @JoinColumn({ name: 'currencyId' })
  currency!: Currency;

  @Column({
    type: 'int',
    nullable: false,
  })
  currencyId!: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  currencyName!: string;

  // =========================
  // WALLET
  // =========================

  @ManyToOne(
    () => Wallet,
    (wallet) => wallet.balances,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'walletId' })
  wallet!: Wallet;
}