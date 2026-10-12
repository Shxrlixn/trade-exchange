import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';

import { v4 as uuidv4 } from 'uuid';

export abstract class BaseEntity {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'char',
    length: 36,
    unique: true,
    nullable: false,
  })
  publicUuid!: string;

  @Column({
    type: 'char',
    length: 36,
    unique: true,
    nullable: false,
  })
  privateUuid!: string;

  @CreateDateColumn({
    type: 'datetime',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'datetime',
  })
  updatedAt!: Date;

  @Column({
    type: 'int',
    nullable: true,
  })
  createdBy!: number | null;

  @Column({
    type: 'int',
    nullable: true,
  })
  updatedBy!: number | null;

  @Column({
    type: 'enum',
    enum: ['Active', 'Inactive'],
    default: 'Active',
  })
  rowStatus!: string;

  @Column({
    type: 'tinyint',
    default: 1,
  })
  rowStatusCode!: number;

  @BeforeInsert()
  generateUuids() {
    this.publicUuid = uuidv4();
    this.privateUuid = uuidv4();
  }

}