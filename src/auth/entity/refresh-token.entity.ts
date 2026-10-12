import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../user/entity/user.entity';
import { BaseEntity } from '../../common/entity/base.entity';

export enum TokenType {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
}

export enum TokenStatus {
  VALID = 10,
  INVALID = 20,
}

@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {

  @Column()
  userId!: number;

  @Column({
    type: 'enum',
    enum: TokenType,
  })
  tokenType!: TokenType;

  @Column({
    type: 'tinyint',
  })
  tokenTypeNumber!: number;

  @Column({
    type: 'tinyint',
    default: TokenStatus.VALID,
  })
  status!: TokenStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;
}