export class AuthEntity {
  id: string;
  email: string;
  name: string;
  lastName: string;
  token: string;
  role: Role
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}
