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
    const user = await this.prisma.user.findFirst({ where: { email: createAuthDto.email } });

    if (!user || !(await bcrypt.compare(createAuthDto.password, user.password))) {
      throw new UnauthorizedException("Credenciales invalidas");
    }

    const payload = { sub: user.id, username: user.email };
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
