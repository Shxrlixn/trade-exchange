import {
  IsNumber,
  IsPositive,
} from 'class-validator';

export class ExecutionUpdateDto {

  @IsNumber()
  @IsPositive()
  filledQuantity!: number;

  @IsNumber()
  @IsPositive()
  executionPrice!: number;
}