import {
  IsDateString,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  @Matches(/^[A-Za-z ]+$/, {
    message: 'Name can contain only letters and spaces',
  })
  name!: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(150)
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;

  @IsNotEmpty()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Phone must be a valid 10-digit Indian mobile number',
  })
  phone!: string;

  @IsNotEmpty()
  @IsString()
  @Length(5, 255)
  address!: string;

  @IsNotEmpty()
  @IsDateString()
  dateOfBirth!: string;

  @IsNotEmpty()
  @IsIn(['Male', 'Female', 'Other'])
  gender!: string;
}