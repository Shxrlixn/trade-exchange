import { IsNotEmpty, Matches } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_]{4,20}$/, {
    message:
      'Username must contain only letters, numbers, and underscores (4-20 characters).',
  })
  username!: string;

  @IsNotEmpty({
    message: 'Password is required.',
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
    {
      message:
        'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.',
    },
  )
  password!: string;
}