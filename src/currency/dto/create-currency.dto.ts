import {
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';

export class CreateCurrencyDto {

  @IsString()
  @IsNotEmpty()
  @Length(3, 5)
  code!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  symbol!: string;
}