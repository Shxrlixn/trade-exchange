import {
  Body,
  Controller,
  Headers,
  Post,
} from '@nestjs/common';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    return this.authService.login(
      username,
      password,
    );
  }

  @Post('refresh')
  async refresh(
    @Headers('x-refresh-token')
    headerRefreshToken: string,

    @Body('refreshToken')
    bodyRefreshToken: string,
  ) {
    const refreshToken =
      headerRefreshToken ||
      bodyRefreshToken;

    console.log(
      'CONTROLLER REFRESH TOKEN:',
      refreshToken
        ? `YES (${refreshToken.length} characters)`
        : 'NO',
    );

    return this.authService.refresh(
      refreshToken,
    );
  }
}