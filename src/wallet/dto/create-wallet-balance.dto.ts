import {
  IsInt,
  Min,
} from 'class-validator';

export class CreateWalletBalanceDto {

  @IsInt()
  @Min(1)
  currencyId!: number;

}