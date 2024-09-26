import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";

export type JobsDocument = HydratedDocument<Jobs>;

@Schema({ timestamps: true })
export class Jobs {
  @Prop({ type: String, required: true, text: true })
  title: String;

  @Prop({ type: String, required: true, text: true })
  description: String;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User", required: true })
  postedBy: String;

  @Prop({ type: Boolean, default: true })
  isActive: Boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const JobsSchema = SchemaFactory.createForClass(Jobs);
