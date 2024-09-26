import { MaxLength, IsEmail, IsNotEmpty } from "class-validator";
import { Transform } from "class-transformer";

export class LoginDto {
  @Transform(param => param.value.toLowerCase())
  @IsEmail({}, { message: "Invalid email address" })
  @MaxLength(255, { message: "email exceeds its character limit" })
  email: string;

  @IsNotEmpty({ message: "Invalid password" })
  password: string;
}
