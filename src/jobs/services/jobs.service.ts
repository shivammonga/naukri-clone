import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Jobs } from "../schemas/jobs.schema";
import { Model } from "mongoose";
import { JobDto } from "../dto/job.dto";
import { PaginationDto } from "src/utils/dto/pagination.dto";
import { JobApplications } from "../schemas/job-applications.schema";
import { JobApplicationsDto } from "../dto/job-applications.dto";
import { JobPipe } from "../pipes/job.pipe";
import { MailService } from "src/mail/services/mail.service";

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Jobs.name) private JobModel: Model<Jobs>,
    @InjectModel(JobApplications.name) private JobApplicationsModel: Model<JobApplications>,
    private JobPipes: JobPipe,
    private readonly mailService: MailService,
  ) {}

  async createJob(createJobDto: JobDto, userId: string): Promise<Jobs> {
    let jobData = {
      title: createJobDto.title,
      description: createJobDto.description,
      postedBy: userId,
    };
    let saveJobData = new this.JobModel(jobData);
    await saveJobData.save();
    return saveJobData;
  }

  async jobListing(paginationDto: PaginationDto): Promise<{ list: Array<Jobs>; count: Number }> {
    const pageSize = paginationDto.pageSize ?? 10;
    const page = paginationDto.page ?? 1;
    const skip = pageSize * (page - 1);
    let query = {
      isActive: true,
    };
    let listProm = this.JobModel.find(query, { postedBy: 0, createdAt: 0, updatedAt: 0, isActive: 0 }).sort({ createdAt: -1 }).skip(skip).limit(pageSize);
    let countProm = this.JobModel.find(query).countDocuments();
    let [list, count] = await Promise.all([listProm, countProm]);
    return {
      list: list,
      count: count,
    };
  }

  async applyJob(jobId: string, userId: string, email: string): Promise<JobApplications> {
    let jobExists = await this.JobModel.findOne({ _id: jobId, isActive: true }, { postedBy: 1 });
    if (!jobExists) throw new BadRequestException("Job not found");
    let appliedJobData = {
      jobId: jobId,
      jobPostedBy: jobExists["postedBy"],
      appliedBy: userId,
    };
    let saveJobData = new this.JobApplicationsModel(appliedJobData);
    await saveJobData.save();
    this.mailService.sendMail({
      to: email.toString(),
      subject: "Job applied",
      template: "job-applied",
      context: {},
    });
    return saveJobData;
  }

  async jobApplications(jobApplicationsDto: JobApplicationsDto, recruiterId: string): Promise<{ list: Array<JobApplications>; count: Number }> {
    let pipeline = this.JobPipes.jobApplications(jobApplicationsDto, recruiterId);
    let resp = await this.JobApplicationsModel.aggregate(pipeline);
    return {
      list: resp[0]?.list ? resp[0].list : [],
      count: resp[0]?.count[0]?.count ? resp[0].count[0].count : 0,
    };
  }

  async appliedJobs(paginationDto: PaginationDto, candidateId: string): Promise<any> {
    let pipeline = this.JobPipes.appliedJobs(paginationDto, candidateId);
    let resp = await this.JobApplicationsModel.aggregate(pipeline);
    return {
      list: resp[0]?.list ? resp[0].list : [],
      count: resp[0]?.count[0]?.count ? resp[0].count[0].count : 0,
    };
  }
}
