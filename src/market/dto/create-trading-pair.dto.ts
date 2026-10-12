import {
  IsInt,
  Min,
} from 'class-validator';

export class CreateTradingPairDto {

  // =========================
  // BASE ASSET
  // =========================

  @IsInt()
  @Min(1)
  baseAssetId!: number;

  // =========================
  // QUOTE ASSET
  // =========================

  @IsInt()
  @Min(1)
  quoteAssetId!: number;
}