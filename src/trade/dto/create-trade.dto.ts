import {
  IsDateString,
  IsInt,
  IsNumber,
  IsPositive,
  IsOptional,
  Min,
  Max,
} from 'class-validator';


export class CreateTradeDto {

  @IsInt()
  @IsPositive()
  buyOrderId!: number;


  @IsInt()
  @IsPositive()
  sellOrderId!: number;


  @IsInt()
  @IsPositive()
  buyerId!: number;


  @IsInt()
  @IsPositive()
  sellerId!: number;


  @IsInt()
  @IsPositive()
  tradingPairId!: number;


  @IsNumber()
  @IsPositive()
  executedPrice!: number;


  @IsNumber()
  @IsPositive()
  executedQuantity!: number;


  @IsInt()
  @IsPositive()
  makerOrderId!: number;


  @IsInt()
  @IsPositive()
  takerOrderId!: number;


  @IsNumber()
  @Min(0)
  @Max(100)
  tdsRate!: number;


  @IsOptional()
  @IsDateString()
  tradeTime?: string;

}

