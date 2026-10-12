import {
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class CreateOrderDto {

  @IsNumber()
  @IsPositive()
  tradingPairId!: number;

  @IsIn(['BUY', 'SELL'])
  side!: string;

  @IsIn(['LIMIT', 'MARKET'])
  orderType!: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  orderPrice?: number;

  @IsNumber()
  @IsPositive()
  quantity!: number;
}