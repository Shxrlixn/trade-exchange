import {
  IsIn,
  IsInt,
} from 'class-validator';

export class UpdateTradingPairStatusDto {

  @IsInt()
  @IsIn([1, 2])
  statusCode!: number;
}