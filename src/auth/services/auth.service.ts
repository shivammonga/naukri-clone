import { Injectable } from "@nestjs/common";
import { BadRequestException, UnauthorizedException } from "@nestjs/common/exceptions";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import { RegisterUserDto } from "../dto/register-user.dto";
import { LoginDto } from "../dto/login.dto";
import { JwtService } from "@nestjs/jwt";
import { AuthTypes } from "../enums/auth.enum";
import { User } from "../schemas/user.schema";

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private UserModel: Model<User>, private JwtService: JwtService) {}

  async getById(id: string): Promise<any> {
    const user = await this.UserModel.findById(id).exec();

    user.password = user.salt = undefined; // delete is not working
    return user;
  }

  async registerUser(registerUserDto: RegisterUserDto): Promise<object> {
    const user = await this.UserModel.findOne({ [registerUserDto.type]: registerUserDto[registerUserDto.type] }).exec();

    if (user) throw new BadRequestException(`${[registerUserDto.type]} already exists`);

    const salt = await bcrypt.genSalt();
    const password = await this.hashPassword(registerUserDto.password, salt);

    const createdUser = new this.UserModel({
      type: registerUserDto.type,
      firstname: registerUserDto.firstname,
      lastname: registerUserDto.lastname ?? "",
      [registerUserDto.type]: registerUserDto[registerUserDto.type],
      password,
      salt,
    });

    await createdUser.save();
    createdUser.password = createdUser.salt = undefined; // delete is not working

    const accessToken = this.JwtService.sign({ userId: createdUser._id });
    return { user: createdUser, accessToken: accessToken };
  }

  async login(loginDto: LoginDto): Promise<any> {
    const user = await this.validateUser(loginDto.type, loginDto[loginDto.type], loginDto.password);

    if (!user) throw new UnauthorizedException();

    const accessToken = this.JwtService.sign({ userId: user._id });

    return { user, accessToken: accessToken };
  }

  async validateUser(type: string, loginString: string, password: string): Promise<any> {
    const user = await this.UserModel.findOne({ [type]: loginString }).exec();
    if (user) {
      const passwordMatches = await user.validatePassword(password);

      user.password = user.salt = undefined; // delete is not working

      if (passwordMatches) {
        return user;
      }
    }
  }

  private async hashPassword(password: string, salt: string): Promise<String> {
    return await bcrypt.hash(password, salt);
  }
}
