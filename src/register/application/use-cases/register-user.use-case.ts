import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { envs } from 'src/config';
import { USER_REPOSITORY } from '../../domain/constants/injection-tokens';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort
  ) { }

  async execute(userData: Omit<User, 'id'>): Promise<{ user: User; inventory: { id: string; name: string } }> {
    const { email, password, name, phoneNumber } = userData;

    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException({ message: "Email already exists" });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, envs.salt);

    // Crear el usuario con la contraseña encriptada
    const user = new User(email, name, hashedPassword, phoneNumber);

    // Crear el usuario e inventario
    return this.userRepository.createWithInventory(user);
  }
} 