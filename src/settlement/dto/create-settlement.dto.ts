import {
  IsInt,
  IsPositive,
} from 'class-validator';


export class CreateSettlementDto {

  // =========================
  // TRADE
  // =========================

  @IsInt()
  @IsPositive()
  tradeId!: number;

}