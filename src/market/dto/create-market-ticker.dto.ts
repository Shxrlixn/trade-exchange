import {
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateMarketTickerDto {

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  currentPrice!: number;

  @IsNotEmpty()
  @IsNumber()
  change24h!: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  high24h!: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  low24h!: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  volume24h!: number;
}