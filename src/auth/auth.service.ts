import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity, Role } from './entities/auth.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private logger = new Logger('Auth Service');
  constructor(private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  async login(createAuthDto: CreateAuthDto): Promise<AuthEntity> {
    //this.logger.debug(`Attempting login for email: ${createAuthDto.email}`);

    const user = await this.prisma.user.findFirst({ where: { email: createAuthDto.email } });
    //this.logger.debug(`User found: ${JSON.stringify(user)}`);

    if (!user || !(await bcrypt.compare(createAuthDto.password, user.password))) {
      //this.logger.error('Invalid credentials');
      throw new UnauthorizedException("Credenciales invalidas");
    }

    const payload: JwtPayload = {
      email: user.email,
      id: user.id,
      name: user.name
    };

    //this.logger.debug(`Generating token with payload: ${JSON.stringify(payload)}`);
    const token = await this.jwtService.signAsync(payload);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      token,
      role: user?.role as Role
    };
  }

  private async validateUser(createAuthDto: CreateAuthDto): Promise<any> {
    const { email, password } = createAuthDto;
    const user = await this.prisma.user.findFirst({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
