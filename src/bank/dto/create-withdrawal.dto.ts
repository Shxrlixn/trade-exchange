import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateWithdrawalDto {

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  userId!: number;

  @IsString()
  @IsNotEmpty()
  transactionId!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  currencyId!: number;

  @IsString()
  @IsNotEmpty()
  currencyName!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  amount!: number;
}