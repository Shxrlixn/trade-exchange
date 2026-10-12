import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import {
  UnauthorizedException,
} from '@nestjs/common';

import {
  Server,
  Socket,
} from 'socket.io';

import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WalletGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect {

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
  ) {}

  // =========================
  // CLIENT CONNECT
  // =========================

  async handleConnection(
    client: Socket,
  ) {

    try {

      const token =
        client.handshake.auth?.token;

      if (!token) {
        throw new UnauthorizedException(
          'Token missing',
        );
      }

      const payload =
        await this.jwtService.verifyAsync(token);

      const userId =
        payload.userId;

      client.data.userId = userId;

      client.join(`user:${userId}`);

      console.log(
        'Wallet socket connected:',
        client.id,
      );

    } catch {

      client.disconnect();
    }
  }

  // =========================
  // BALANCE UPDATED
  // =========================

  emitBalanceUpdated(
    userId: number,
    data: {
      currencyCode: string;
      availableBalance: number;
      lockedBalance: number;
    },
  ) {

    this.server
      .to(`user:${userId}`)
      .emit(
        'wallet.balance.updated',
        data,
      );
  }

  // =========================
  // NEW CURRENCY ADDED
  // =========================

  emitCurrencyAdded(
    userId: number,
    data: any,
  ) {

    this.server
      .to(`user:${userId}`)
      .emit(
        'wallet.currency.added',
        data,
      );
  }

  // =========================
  // DISCONNECT
  // =========================

  handleDisconnect(
    client: Socket,
  ) {

    console.log(
      'Wallet socket disconnected:',
      client.id,
    );
  }
}