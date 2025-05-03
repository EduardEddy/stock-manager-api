import { User } from '../entities/user.entity';

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  createWithInventory(user: User): Promise<{ user: User; inventory: { id: string; name: string } }>;
} 