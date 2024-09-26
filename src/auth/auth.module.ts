import { Module } from "@nestjs/common";
import { AuthService } from "./services/auth.service";
import { AuthController } from "./controllers/auth.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { User, UserSchema } from "./schemas/user.schema";

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: "jwt",
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "24h" },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [PassportModule, AuthService],
})
export class AuthModule {}
