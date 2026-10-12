import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreatePaymentDto {

  // =========================
  // USER ID
  // =========================

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  userId!: number;

  // =========================
  // USER PUBLIC UUID
  // =========================

  @IsString()
  @IsNotEmpty()
  userPublicUuid!: string;

  // =========================
  // USER SERVICE TRANSACTION ID
  // =========================

  @IsString()
  @IsNotEmpty()
  transactionId!: string;

  // =========================
  // DEPOSIT AMOUNT
  // =========================

  @IsNumber()
  @Min(0.01)
  amount!: number;

}