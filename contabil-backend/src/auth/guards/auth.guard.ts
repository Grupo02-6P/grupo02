import {
  CanActivate,
  ExecutionContext,
  Global,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { CaslAbilityService } from 'src/casl/casl-ability/casl-ability.service';
import { packRules } from '@casl/ability/extra';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
    private abilityService: CaslAbilityService,
  ) {}

  async validateUser(decoded) {
    if (!decoded) {
      return null;
    }
    return await this.userService.findOneWithoutCasl(decoded.sub);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token não fornecido');
    }

    try {
      const decoded = this.jwtService.verify(token);
      const userExists: any = await this.validateUser(decoded);
      if (!userExists) {
        throw new UnauthorizedException('Usuário não encontrado');
      }
      await this.abilityService.createForUser(userExists);
      userExists.abilities = packRules(this.abilityService.ability.rules);

      delete userExists.password;

      request['user'] = userExists;
    } catch (err) {
      console.error(err);
      throw new UnauthorizedException('Token inválido');
    }

    return true;
  }
}
