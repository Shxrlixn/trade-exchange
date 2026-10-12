import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';

import {
  RefreshToken,
  TokenType,
  TokenStatus,
} from './entity/refresh-token.entity';

import {
  ConfigService,
} from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
) {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,

    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Allow expired JWT to reach validate()
      ignoreExpiration: true,

      secretOrKey:
        configService.get<string>(
          'JWT_SECRET',
        )!,

      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    payload: any,
  ) {
    // =========================
    // GET ACCESS TOKEN
    // =========================

    const token =
      ExtractJwt.fromAuthHeaderAsBearerToken()(
        req,
      );

    if (!token) {
      throw new UnauthorizedException(
        'Access token not provided',
      );
    }

    // =========================
    // GET USER ID FROM JWT
    // =========================

    const userId =
      payload?.userId;

    if (!userId) {
      throw new UnauthorizedException(
        'User identifier missing',
      );
    }

    // =========================
    // GET PUBLIC UUID FROM JWT
    // =========================

    const publicUuid =
      payload?.publicUuid;

    if (!publicUuid) {
      throw new UnauthorizedException(
        'Access token identifier missing',
      );
    }

    // =========================
    // FIND ACCESS TOKEN
    // =========================

    const tokenRecord =
      await this.refreshTokenRepository.findOne({
        where: {
          userId: userId,
          publicUuid: publicUuid,
          tokenType: TokenType.ACCESS,
        },
      });

    if (!tokenRecord) {
      throw new UnauthorizedException(
        'Access token not found',
      );
    }

    // =========================
    // CHECK JWT EXPIRATION
    // =========================

    const currentTime =
      Math.floor(Date.now() / 1000);

    if (
      payload.exp &&
      payload.exp < currentTime
    ) {
      tokenRecord.status =
        TokenStatus.INVALID;

      await this.refreshTokenRepository.save(
        tokenRecord,
      );

      throw new UnauthorizedException(
        'Access token expired',
      );
    }

    // =========================
    // CHECK DATABASE STATUS
    // =========================

    if (
      tokenRecord.status !==
      TokenStatus.VALID
    ) {
      throw new UnauthorizedException(
        'Access token is invalid',
      );
    }

    // =========================
    // VALID TOKEN
    // =========================

    return payload;
  }
}