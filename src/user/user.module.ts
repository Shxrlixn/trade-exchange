import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entity/user.entity';

import { Wallet } from '../wallet/entity/wallet.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Wallet,
    ]),
  ],

  controllers: [UserController],

  providers: [UserService],
})
export class UserModule {}