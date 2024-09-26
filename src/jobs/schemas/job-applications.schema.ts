import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";

export type JobApplicationsDocument = HydratedDocument<JobApplications>;

@Schema({ timestamps: true })
export class JobApplications {
  @Prop({ type: SchemaTypes.ObjectId, ref: "Jobs", required: true, index: true })
  jobId: String;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User", required: true, index: true })
  appliedBy: String;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User", required: true, index: true })
  jobPostedBy: String;

  @Prop()
  createdAt: Date;
}

export const JobApplicationsSchema = SchemaFactory.createForClass(JobApplications);
