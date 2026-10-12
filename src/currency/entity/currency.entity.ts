import { Entity, Column } from 'typeorm';

import { BaseEntity } from '../../common/entity/base.entity';

@Entity('currency')
export class Currency extends BaseEntity {

  @Column({
    type: 'varchar',
    length: 5,
    unique: true,
    nullable: false,
  })
  code!: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 5,
    nullable: false,
  })
  symbol!: string;

  @Column({
    type: 'enum',
    enum: ['Active', 'Inactive'],
    default: 'Active',
  })
  status!: string;

  @Column({
    type: 'int',
    default: 1,
  })
  statusCode!: number;
}