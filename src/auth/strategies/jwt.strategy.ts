import { PassportStrategy } from "@nestjs/passport"
import { User } from "@prisma/client"
import { ExtractJwt, Strategy } from "passport-jwt"
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { PrismaService } from "src/prisma/prisma.service";
import { envs } from "src/config";
import { Injectable, UnauthorizedException, Logger } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private logger = new Logger('JwtStrategy');

  constructor(private readonly prisma: PrismaService) {
    super({
      secretOrKey: envs.secretKey,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    //this.logger.debug(`Validating token for user: ${JSON.stringify(payload)}`);

    // Primero intentamos encontrar por ID
    let user = await this.prisma.user.findUnique({ where: { id: payload.id } });

    // Si no encontramos por ID, intentamos por email
    if (!user) {
      //this.logger.debug(`User not found by ID, trying email: ${payload.email}`);
      user = await this.prisma.user.findFirst({ where: { email: payload.email } });
    }

    if (!user) {
      //this.logger.error(`User not found for payload: ${JSON.stringify(payload)}`);
      throw new UnauthorizedException('Token not valid');
    }

    //this.logger.debug(`User found: ${JSON.stringify(user)}`);
    return user;
  }
}