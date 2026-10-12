import {
  IsInt,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateWithdrawalDto {

  @IsInt()
  @Min(1)
  currencyId!: number;

  @IsNumber()
  @Min(1)
  amount!: number;
}