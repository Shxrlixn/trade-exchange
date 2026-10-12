import {
  IsInt,
  Min,
} from 'class-validator';

export class CreateWalletDto {

  @IsInt()
  @Min(1)
  userId!: number;

  @IsInt()
  @Min(1)
  currencyId!: number;

}