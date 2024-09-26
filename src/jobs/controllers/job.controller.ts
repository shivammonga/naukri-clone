import { Body, Controller, HttpCode, Param, Post, UseGuards } from "@nestjs/common";
import { JobsService } from "../services/jobs.service";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/auth/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { RoleType } from "src/auth/enums/role.enum";
import { GetUser } from "src/auth/decorators/get-user.decorator";
import { JobDto } from "../dto/job.dto";
import { Jobs } from "../schemas/jobs.schema";
import { PaginationDto } from "src/utils/dto/pagination.dto";
import { JobApplicationsDto } from "../dto/job-applications.dto";
import { JobApplications } from "../schemas/job-applications.schema";

@Controller("job")
export class JobController {
  constructor(private jobsService: JobsService) {}

  @HttpCode(201)
  @Post()
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(RoleType.RECRUITER)
  async createJob(@GetUser() user, @Body() createJobDto: JobDto): Promise<{ message: String; data: Jobs }> {
    let data = await this.jobsService.createJob(createJobDto, user._id);
    return {
      message: "Job created",
      data: data,
    };
  }

  @HttpCode(200)
  @Post("/list")
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(RoleType.CANDIDATE)
  async jobListing(@Body() paginationDto: PaginationDto): Promise<{ message: String; data: { list: Array<Jobs>; count: Number } }> {
    let data = await this.jobsService.jobListing(paginationDto);
    return {
      message: "List of jobs",
      data: data,
    };
  }

  @HttpCode(201)
  @Post("/apply/:jobId")
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(RoleType.CANDIDATE)
  async applyJob(@GetUser() user, @Param("jobId") jobId: string): Promise<{ message: String }> {
    await this.jobsService.applyJob(jobId, user._id);
    return {
      message: "Job applied successfully",
    };
  }

  @HttpCode(200)
  @Post("/applications")
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(RoleType.RECRUITER)
  async jobApplications(@GetUser() user, @Body() jobApplicationsDto: JobApplicationsDto): Promise<{ message: String; data: { list: Array<JobApplications>; count: Number } }> {
    let data = await this.jobsService.jobApplications(jobApplicationsDto, user._id);
    return {
      message: "Job applications",
      data: data,
    };
  }

  @HttpCode(200)
  @Post("/applied")
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(RoleType.CANDIDATE)
  async appliedJobs(@GetUser() user, @Body() paginationDto: PaginationDto): Promise<{ message: String; data: { list: Array<Jobs>; count: Number } }> {
    let data = await this.jobsService.appliedJobs(paginationDto, user._id);
    return {
      message: "Applied Jobs",
      data: data,
    };
  }
}
