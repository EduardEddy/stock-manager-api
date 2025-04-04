import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateRegisterDto } from './dto/create-register.dto';
import * as bcrypt from 'bcrypt';
import { envs } from 'src/config';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class RegisterService {
  private logger = new Logger('Register Service');
  constructor(private readonly prisma: PrismaService) { }
  async create(createRegisterDto: CreateRegisterDto) {
    try {
      const { password, email, name, phoneNumber = "" } = createRegisterDto;
      const findEmail = await this.searchUserByEmail(email);
      if (findEmail) {
        throw new BadRequestException({ message: "Email already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, envs.salt);
      return this.prisma.user.create({ data: { email, name, password: hashedPassword, phoneNumber } });
    } catch (error) {
      this.logger.error("ERROR on create function: ", error);
      throw new BadRequestException("Error on create function");
    }
  }

  async searchUserByEmail(email: string) {
    try {
      return this.prisma.user.findUnique({ where: { email } });
    } catch (error) {
      this.logger.error("ERROR on searchUserByEmail function: ", error);
      throw new BadRequestException("Error on searchUserByEmail function");
    }
  }
}
