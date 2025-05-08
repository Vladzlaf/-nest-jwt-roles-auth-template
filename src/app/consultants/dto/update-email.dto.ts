import { IsNotEmpty } from "class-validator";

import { IsEmail } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class UpdateEmailDto {
  @ApiProperty({
    type: String,
    description: 'The email of the consultant',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
    