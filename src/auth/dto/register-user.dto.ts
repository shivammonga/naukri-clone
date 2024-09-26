import { MaxLength, IsEnum, IsEmail, IsStrongPassword } from "class-validator";
import { Transform } from "class-transformer";
import { RoleType } from "../enums/role.enum";

export class RegisterUserDto {
  @Transform(param => param.value.toLowerCase())
  @IsEmail({}, { message: "Invalid email address" })
  @MaxLength(255, { message: "Invalid email address" })
  email: string;

  @IsStrongPassword({}, { message: "Password is not strong enough" })
  password: string;

  @IsEnum(RoleType, { message: "Invalid role type" })
  role: string;
}
