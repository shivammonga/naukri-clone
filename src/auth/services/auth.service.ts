import { Injectable } from "@nestjs/common";
import { BadRequestException, UnauthorizedException } from "@nestjs/common/exceptions";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import { RegisterUserDto } from "../dto/register-user.dto";
import { LoginDto } from "../dto/login.dto";
import { JwtService } from "@nestjs/jwt";
import { User } from "../schemas/user.schema";

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private UserModel: Model<User>, private JwtService: JwtService) {}

  async getById(id: string): Promise<any> {
    const user = await this.UserModel.findById(id);
    user.password = user.salt = undefined;
    return user;
  }

  async registerUser(registerUserDto: RegisterUserDto): Promise<{ user: User; accessToken: string }> {
    const salt = await bcrypt.genSalt();
    const password = await this.hashPassword(registerUserDto.password, salt);
    const createdUser = new this.UserModel({
      email: registerUserDto.email,
      role: registerUserDto.role,
      password,
      salt,
    });
    await createdUser.save();
    createdUser.password = createdUser.salt = undefined;
    const accessToken = this.createToken(createdUser["_id"].toString());
    return { user: createdUser, accessToken: accessToken };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; accessToken: string }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) throw new UnauthorizedException();
    const accessToken = this.createToken(user._id);
    return { user, accessToken: accessToken };
  }

  createToken(userId: string) {
    const accessToken = this.JwtService.sign({ userId: userId });
    return accessToken;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.UserModel.findOne({ email: email });
    if (!user) throw new BadRequestException("Invalid email / User not found");
    const passwordMatches = await user.validatePassword(password);
    if (!passwordMatches) throw new BadRequestException("Incorrect password");
    user.password = user.salt = undefined;
    return user;
  }

  private async hashPassword(password: string, salt: string): Promise<String> {
    return await bcrypt.hash(password, salt);
  }
}
