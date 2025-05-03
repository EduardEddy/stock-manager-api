export class User {
  id?: string;
  email: string;
  name: string;
  phoneNumber?: string;
  password: string;
  role?: string;

  constructor(email: string, name: string, password: string, phoneNumber?: string, role?: string) {
    this.email = email;
    this.name = name;
    this.password = password;
    this.phoneNumber = phoneNumber;
    this.role = role || 'USER';
  }
} 