import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthService } from "./services/auth.service";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>("roles", context.getHandler());
    const request = context.switchToHttp().getRequest();

    if (request?.user) {
      const { id } = request.user;
      const user = await this.authService.getById(id);
      return roles.includes(user.role);
    }

    return false;
  }
}
