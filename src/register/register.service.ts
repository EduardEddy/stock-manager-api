/*import { BadRequestException, HttpException, Injectable, Logger } from '@nestjs/common';
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

      // Verificar si el email ya existe
      const findEmail = await this.searchUserByEmail(email);
      if (findEmail) {
        throw new BadRequestException({ message: "Email already exists" });
      }

      // Encriptar la contraseña
      const hashedPassword = await bcrypt.hash(password, envs.salt);

      // Crear el usuario e inventario en una transacción
      return await this.prisma.$transaction(async (tx) => {
        // 1. Crear el usuario
        const user = await tx.user.create({
          data: {
            email,
            name,
            password: hashedPassword,
            phoneNumber
          }
        });

        // 2. Crear inventario para el usuario
        const inventory = await tx.inventory.create({
          data: {
            name: `Inventario de ${name}`,
            description: 'Inventario principal',
            userId: user.id
          }
        });

        // 3. Devolver el usuario con la información del inventario
        const { password, ...userData } = user;
        return {
          ...userData,
          inventory: {
            id: inventory.id,
            name: inventory.name
          }
        };
      });

    } catch (error) {
      this.logger.error("ERROR on create function: ", error);
      if (error instanceof HttpException) {
        throw error;
      }
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
}*/