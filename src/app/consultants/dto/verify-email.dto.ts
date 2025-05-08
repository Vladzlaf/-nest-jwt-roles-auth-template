import { IsEmail } from "class-validator";

import { IsNotEmpty } from "class-validator";

export class VerifyEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  code: string;
}   