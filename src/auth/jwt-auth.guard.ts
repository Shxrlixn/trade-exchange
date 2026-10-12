import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard
  implements CanActivate
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request =
      context.switchToHttp().getRequest();

    const response =
      context.switchToHttp().getResponse();

    // =========================
    // GET ACCESS TOKEN
    // =========================

    const authHeader =
      request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException(
        'Authorization header missing',
      );
    }

    const [type, accessToken] =
      authHeader.split(' ');

    if (
      type !== 'Bearer' ||
      !accessToken
    ) {
      throw new UnauthorizedException(
        'Invalid authorization header',
      );
    }

    // =========================
    // CHECK ACCESS TOKEN
    // =========================

    const isValid =
      await this.authService.validateAccessToken(
        accessToken,
      );

    // =========================
    // ACCESS TOKEN VALID
    // =========================

    if (isValid) {
      try {
        const payload =
          this.jwtService.verify(
            accessToken,
          );

        request.user = payload;

        return true;
      } catch (error) {
        throw new UnauthorizedException(
          'Access token is invalid or expired',
        );
      }
    }

    // =========================
    // ACCESS TOKEN INVALID/EXPIRED
    // =========================

    console.log(
      'ACCESS TOKEN INVALID/EXPIRED',
    );

    // =========================
    // UPDATE EXPIRED TOKEN STATUS
    // =========================

    await this.authService.handleExpiredAccessToken(
      accessToken,
    );

    // =========================
    // GET REFRESH TOKEN
    // =========================

    const refreshToken =
      request.headers['x-refresh-token'];

    if (!refreshToken) {
      throw new UnauthorizedException(
        'Access token expired. Refresh token required.',
      );
    }

    // =========================
    // GENERATE NEW ACCESS TOKEN
    // =========================

    const result =
      await this.authService.refresh(
        refreshToken,
      );

    const newAccessToken =
      result.access_token;

    // =========================
    // SEND NEW TOKEN TO CLIENT
    // =========================

    response.setHeader(
      'X-Access-Token',
      newAccessToken,
    );

    // =========================
    // VERIFY NEW ACCESS TOKEN
    // =========================

    try {
      const payload =
        this.jwtService.verify(
          newAccessToken,
        );

      request.user = payload;

      console.log(
        'ACCESS TOKEN AUTOMATICALLY REFRESHED',
      );

      return true;
    } catch (error) {
      throw new UnauthorizedException(
        'New access token is invalid',
      );
    }
  }
}