/*import {
  Injectable,
} from '@nestjs/common';

import Redis from 'ioredis';

@Injectable()
export class MarketRedisService {

  private readonly redis: Redis;

  constructor() {

    this.redis = new Redis({
      host: 'localhost',
      port: 6000,
    });
  }

  // =========================
  // SET MARKET TICKER
  // =========================

  async setTicker(
    pairName: string,
    ticker: object,
  ) {

    await this.redis.set(
      `ticker:${pairName}`,
      JSON.stringify(ticker),
    );
  }

  // =========================
  // GET MARKET TICKER
  // =========================

  async getTicker(
    pairName: string,
  ) {

    const ticker =
      await this.redis.get(
        `ticker:${pairName}`,
      );

    if (!ticker) {
      return null;
    }

    return JSON.parse(ticker);
  }
}
  */