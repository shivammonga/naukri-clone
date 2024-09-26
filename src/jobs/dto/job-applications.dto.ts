import { IsMongoId } from "class-validator";
import { PaginationDto } from "src/utils/dto/pagination.dto";

export class JobApplicationsDto extends PaginationDto {
  @IsMongoId({ message: "Required valid job id" })
  jobId: string;
}
