import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtModule } from '@nestjs/jwt';

import { PassportModule } from '@nestjs/passport';

import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import { AuthController } from './auth.controller';

import { AuthService } from './auth.service';

import { JwtStrategy } from './jwt.strategy';

import { JwtAuthGuard } from './jwt-auth.guard';

import { RefreshToken } from './entity/refresh-token.entity';

import { User } from '../user/entity/user.entity';

@Module({
  imports: [
    PassportModule,

    TypeOrmModule.forFeature([
      RefreshToken,
      User,
    ]),

    JwtModule.registerAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (
        configService: ConfigService,
      ) => ({
        secret:
          configService.get<string>(
            'JWT_SECRET',
          )!,
      }),
    }),
  ],

  controllers: [
    AuthController,
  ],

  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
  ],

  exports: [
    AuthService,
    JwtAuthGuard,
    JwtModule,
  ],
})
export class AuthModule {}