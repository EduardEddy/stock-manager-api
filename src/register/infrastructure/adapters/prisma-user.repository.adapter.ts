import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class PrismaUserRepositoryAdapter implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) { }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    return new User(
      user.email,
      user.name,
      user.password,
      user.phoneNumber,
      user.role
    );
  }

  async create(user: User): Promise<User> {
    const createdUser = await this.prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: user.password,
        phoneNumber: user.phoneNumber,
        role: user.role as 'ADMIN' | 'USER'
      }
    });

    return new User(
      createdUser.email,
      createdUser.name,
      createdUser.password,
      createdUser.phoneNumber,
      createdUser.role
    );
  }

  async createWithInventory(user: User): Promise<{ user: User; inventory: { id: string; name: string } }> {
    return this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: user.email,
          name: user.name,
          password: user.password,
          phoneNumber: user.phoneNumber,
          role: user.role as 'ADMIN' | 'USER'
        }
      });

      const inventory = await tx.inventory.create({
        data: {
          name: `Inventario de ${user.name}`,
          description: 'Inventario principal',
          userId: createdUser.id
        }
      });

      return {
        user: new User(
          createdUser.email,
          createdUser.name,
          createdUser.password,
          createdUser.phoneNumber,
          createdUser.role
        ),
        inventory: {
          id: inventory.id,
          name: inventory.name
        }
      };
    });
  }
} 