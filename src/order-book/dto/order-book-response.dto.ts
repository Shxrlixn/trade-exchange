import { PriceLevelDto } from './price-level.dto';

export class OrderBookResponseDto {
  tradingPairId: number;
  bids: PriceLevelDto[];
  asks: PriceLevelDto[];
}