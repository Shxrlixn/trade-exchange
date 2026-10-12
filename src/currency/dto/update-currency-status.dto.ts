import {
  IsIn,
  IsInt,
} from 'class-validator';

export class UpdateCurrencyStatusDto {
  @IsInt()
  @IsIn([1, 2])
  statusCode!: number;
}