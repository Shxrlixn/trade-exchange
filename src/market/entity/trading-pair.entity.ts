import {

  Entity,

  Column,

  ManyToOne,

  JoinColumn,

  Unique,

} from 'typeorm';

import { BaseEntity } from '../../common/entity/base.entity';

import { Currency } from '../../currency/entity/currency.entity';


@Entity('trading_pair')

@Unique(['pairName'])

export class TradingPair extends BaseEntity {

  // =========================
  // PAIR NAME
  // =========================

  @Column({

    type: 'varchar',

    length: 20,

    nullable: false,

  })

  pairName!: string;


  // =========================
  // BASE ASSET
  // =========================

  @ManyToOne(

    () => Currency,

    {

      nullable: false,

    },

  )

  @JoinColumn({

    name: 'baseAssetId',

  })

  baseAsset!: Currency;


  @Column({

    type: 'int',

    nullable: false,

  })

  baseAssetId!: number;


  // =========================
  // QUOTE ASSET
  // =========================

  @ManyToOne(

    () => Currency,

    {

      nullable: false,

    },

  )

  @JoinColumn({

    name: 'quoteAssetId',

  })

  quoteAsset!: Currency;


  @Column({

    type: 'int',

    nullable: false,

  })

  quoteAssetId!: number;


  // =========================
  // MAKER FEE
  // =========================

  @Column({

    type: 'decimal',

    precision: 10,

    scale: 6,

    default: 0,

  })

  makerFee!: number;


  // =========================
  // TAKER FEE
  // =========================

  @Column({

    type: 'decimal',

    precision: 10,

    scale: 6,

    default: 0,

  })

  takerFee!: number;


  // =========================
  // TRADING PAIR STATUS
  // =========================

  @Column({

    type: 'enum',

    enum: ['ACTIVE', 'INACTIVE'],

    default: 'ACTIVE',

  })

  status!: string;


  @Column({

    type: 'int',

    default: 1,

  })

  statusCode!: number;

}