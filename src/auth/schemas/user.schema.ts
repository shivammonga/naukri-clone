import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import * as bcrypt from "bcrypt";
import { RoleType } from "../enums/role.enum";

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, required: true })
  email: String;

  @Prop({ required: true, enum: RoleType })
  role: String;

  @Prop()
  salt: String;

  @Prop()
  password: String;

  @Prop({ type: Boolean, default: true })
  isActive: Boolean;

  validatePassword: Function;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.validatePassword = async function (password: string): Promise<boolean> {
  const hash = await bcrypt.hash(password, this.salt);
  return this.password === hash;
};
