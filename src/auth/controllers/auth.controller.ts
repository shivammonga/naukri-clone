import { Controller, Post, Body, HttpCode } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { RegisterUserDto } from "../dto/register-user.dto";
import { LoginDto } from "../dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(201)
  @Post("/register")
  async registerUser(@Body() registerUserDto: RegisterUserDto): Promise<object> {
    const data = await this.authService.registerUser(registerUserDto);

    return {
      message: "User registered",
      data: data,
    };
  }

  @HttpCode(200)
  @Post("/login")
  async login(@Body() loginDto: LoginDto) {
    const data = await this.authService.login(loginDto);

    return {
      message: "User Login",
      data: data,
    };
  }

  @HttpCode(200)
  @Post("/logout")
  async logout() {}
}
