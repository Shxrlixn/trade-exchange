import {
  IsInt,
  IsNumber,
  Min,
} from 'class-validator';

import {
  Type,
} from 'class-transformer';

export class CreateDepositDto {

  @Type(() => Number)
  @IsInt()
  @Min(1)
  currencyId!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.00000001)
  amount!: number;

}