import { IsString } from "class-validator";
import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateConsultantsDto {
  @ApiProperty({
    type: String,
    description: 'The name of the consultant',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    type: String,
    description: 'The location of the consultant',
    example: 'New York, NY',
  })
  @IsString()
  @IsNotEmpty()
  location: string;
}