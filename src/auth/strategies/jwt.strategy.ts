import { PassportStrategy } from "@nestjs/passport"
import { User } from "@prisma/client"
import { ExtractJwt, Strategy } from "passport-jwt"
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { PrismaService } from "src/prisma/prisma.service";
import { envs } from "src/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly prisma: PrismaService) {
		super({
			secretOrKey: envs.secretKey,
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
		});
	}
	async validate(payload: JwtPayload): Promise<User> {
		const { email } = payload;
		const user = await this.prisma.user.findFirst({ where: { email } });
		if (!user) {
			throw new UnauthorizedException('Token not valid');
		}
		return user;
	}
}