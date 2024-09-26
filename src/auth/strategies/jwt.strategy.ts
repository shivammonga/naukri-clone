import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtPayload } from "../interface/jwt-payload.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../schemas/user.schema";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectModel(User.name) private UserModel: Model<User>, private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>("JWT_SECRET"),
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    const { userId } = payload;
    const user = await this.UserModel.findById(userId).exec();

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
