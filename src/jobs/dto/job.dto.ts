import { IsString } from "class-validator";

export class JobDto {
  @IsString({ message: "Invalid job title" })
  title: String;

  @IsString({ message: "Invalid job description" })
  description: String;
}
