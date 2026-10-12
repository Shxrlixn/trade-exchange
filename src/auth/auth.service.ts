import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import {
  ConfigService,
} from '@nestjs/config';

import { StringValue } from 'ms';

import { User } from '../user/entity/user.entity';

import {
  RefreshToken,
  TokenType,
  TokenStatus,
} from './entity/refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,

    private configService: ConfigService,

    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async login(
    username: string,
    password: string,
  ) {
    // =========================
    // FIND USER
    // =========================

    const user =
      await this.userRepository.findOne({
        where: {
          email: username,
        },
        select: {
          id: true,
          email: true,
          password: true,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    // =========================
    // CHECK LOGIN PASSWORD
    // =========================

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password,
      );

    if (!passwordMatch) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const userId = user.id;

    // =========================
    // INVALIDATE CURRENT SESSION
    // =========================

    const currentTokens =
      await this.refreshTokenRepository.find({
        where: {
          userId: userId,
          status: TokenStatus.VALID,
        },
      });

    for (const token of currentTokens) {
      token.status =
        TokenStatus.INVALID;
    }

    if (currentTokens.length > 0) {
      await this.refreshTokenRepository.save(
        currentTokens,
      );
    }

    // =========================
    // CREATE ACCESS TOKEN RECORD
    // =========================

    const accessTokenRecord =
      this.refreshTokenRepository.create({
        userId: userId,

        tokenType:
          TokenType.ACCESS,

        tokenTypeNumber: 1,

        status:
          TokenStatus.VALID,
      });

    await this.refreshTokenRepository.save(
      accessTokenRecord,
    );

    // =========================
    // GENERATE ACCESS JWT
    // =========================

    const accessPayload = {
      userId: user.id,

      publicUuid:
        accessTokenRecord.publicUuid,
    };

    const accessToken =
      this.jwtService.sign(
        accessPayload,
        {
          expiresIn:
            this.configService.get<StringValue>(
              'JWT_ACCESS_EXPIRES_IN',
            )!,
        },
      );

    // =========================
    // CREATE REFRESH TOKEN RECORD
    // =========================

    const refreshTokenRecord =
      this.refreshTokenRepository.create({
        userId: userId,

        tokenType:
          TokenType.REFRESH,

        tokenTypeNumber: 2,

        status:
          TokenStatus.VALID,
      });

    await this.refreshTokenRepository.save(
      refreshTokenRecord,
    );

    // =========================
    // GENERATE REFRESH JWT
    // =========================

    const refreshPayload = {
      userId: user.id,

      publicUuid:
        refreshTokenRecord.publicUuid,
    };

    const refreshToken =
      this.jwtService.sign(
        refreshPayload,
        {
          expiresIn:
            this.configService.get<StringValue>(
              'JWT_REFRESH_EXPIRES_IN',
            )!,
        },
      );

    // =========================
    // RETURN TOKENS
    // =========================

    return {
      access_token:
        accessToken,

      refresh_token:
        refreshToken,
    };
  }

  async handleExpiredAccessToken(
    accessToken: string,
  ) {
    try {
      const payload =
        this.jwtService.decode(
          accessToken,
        ) as {
          publicUuid?: string;
        };

      if (!payload?.publicUuid) {
        return;
      }

      const tokenRecord =
        await this.refreshTokenRepository.findOne({
          where: {
            publicUuid:
              payload.publicUuid,

            tokenType:
              TokenType.ACCESS,
          },
        });

      if (!tokenRecord) {
        return;
      }

      try {
        this.jwtService.verify(
          accessToken,
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.name ===
            'TokenExpiredError'
        ) {
          if (
            tokenRecord.status ===
            TokenStatus.VALID
          ) {
            tokenRecord.status =
              TokenStatus.INVALID;

            await this.refreshTokenRepository.save(
              tokenRecord,
            );
          }
        }
      }
    } catch (error) {
      console.log(
        'HANDLE EXPIRED ACCESS TOKEN ERROR:',
        error,
      );
    }
  }

  async validateAccessToken(
    accessToken: string,
  ): Promise<boolean> {
    let payload: any;

    try {
      payload =
        this.jwtService.verify(
          accessToken,
        );
    } catch (error) {
      return false;
    }

    if (!payload?.publicUuid) {
      return false;
    }

    if (!payload?.userId) {
      return false;
    }

    const tokenRecord =
      await this.refreshTokenRepository.findOne({
        where: {
          userId: payload.userId,

          publicUuid:
            payload.publicUuid,

          tokenType:
            TokenType.ACCESS,
        },
      });

    if (!tokenRecord) {
      return false;
    }

    if (
      tokenRecord.status !==
      TokenStatus.VALID
    ) {
      return false;
    }

    return true;
  }

  async refresh(
    refreshToken: string,
  ) {
    try {
      if (!refreshToken) {
        throw new UnauthorizedException(
          'Refresh token was not provided',
        );
      }

      let payload: any;

      try {
        payload =
          this.jwtService.verify(
            refreshToken,
          );
      } catch (error) {
        if (
          error instanceof Error &&
          error.name ===
            'TokenExpiredError'
        ) {
          throw new UnauthorizedException(
            'Refresh token expired',
          );
        }

        throw new UnauthorizedException(
          'Invalid refresh token',
        );
      }

      if (!payload?.publicUuid) {
        throw new UnauthorizedException(
          'Refresh token identifier missing',
        );
      }

      if (!payload?.userId) {
        throw new UnauthorizedException(
          'User identifier missing',
        );
      }

      const tokenRecord =
        await this.refreshTokenRepository.findOne({
          where: {
            userId: payload.userId,

            publicUuid:
              payload.publicUuid,

            tokenType:
              TokenType.REFRESH,
          },
        });

      if (!tokenRecord) {
        throw new UnauthorizedException(
          'Refresh token not found in database',
        );
      }

      if (
        tokenRecord.status !==
        TokenStatus.VALID
      ) {
        throw new UnauthorizedException(
          'Refresh token is invalid',
        );
      }

      // =========================
      // INVALIDATE OLD ACCESS TOKEN
      // =========================

      const currentAccessToken =
        await this.refreshTokenRepository.findOne({
          where: {
            userId:
              tokenRecord.userId,

            tokenType:
              TokenType.ACCESS,

            status:
              TokenStatus.VALID,
          },
        });

      if (currentAccessToken) {
        currentAccessToken.status =
          TokenStatus.INVALID;

        await this.refreshTokenRepository.save(
          currentAccessToken,
        );
      }

      // =========================
      // CREATE NEW ACCESS TOKEN
      // =========================

      const newAccessTokenRecord =
        this.refreshTokenRepository.create({
          userId:
            tokenRecord.userId,

          tokenType:
            TokenType.ACCESS,

          tokenTypeNumber: 1,

          status:
            TokenStatus.VALID,
        });

      await this.refreshTokenRepository.save(
        newAccessTokenRecord,
      );

      // =========================
      // GENERATE NEW ACCESS JWT
      // =========================

      const newAccessToken =
        this.jwtService.sign(
          {
            userId:
              tokenRecord.userId,

            publicUuid:
              newAccessTokenRecord.publicUuid,
          },
          {
            expiresIn:
              this.configService.get<StringValue>(
                'JWT_ACCESS_EXPIRES_IN',
              )!,
          },
        );

      return {
        access_token:
          newAccessToken,
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      throw new UnauthorizedException(
        'Invalid or expired refresh token',
      );
    }
  }
}