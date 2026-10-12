import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateMarketTickerDto {

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price!: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsOptional()
  @IsDateString()
  timestamp?: string;
}