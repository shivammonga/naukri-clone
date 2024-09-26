import { Module } from "@nestjs/common";
import { JobController } from "./controllers/job.controller";
import { JobsService } from "./services/jobs.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Jobs, JobsSchema } from "./schemas/jobs.schema";
import { AuthModule } from "src/auth/auth.module";
import { JobApplications, JobApplicationsSchema } from "./schemas/job-applications.schema";
import { JobPipe } from "./pipes/job.pipe";
import { MailModule } from "src/mail/mail.module";

@Module({
  imports: [
    AuthModule,
    MailModule,
    MongooseModule.forFeature([{ name: Jobs.name, schema: JobsSchema }]),
    MongooseModule.forFeature([{ name: JobApplications.name, schema: JobApplicationsSchema }]),
  ],
  controllers: [JobController],
  providers: [JobsService, JobPipe],
})
export class JobsModule {}
