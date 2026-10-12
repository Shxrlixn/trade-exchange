import {
  IsIn,
  IsNotEmpty,
  IsString,
  IsInt,
} from 'class-validator';

export class BankWebhookDto {

  @IsString()
  @IsNotEmpty()
  transactionId!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([
    'DEPOSIT',
    'WITHDRAWAL',
  ])
  type!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([
    'CONFIRMED',
    'REJECTED',
  ])
  status!: string;

  @IsInt()
  @IsIn([10, 20])
  statusCode!: number;
}