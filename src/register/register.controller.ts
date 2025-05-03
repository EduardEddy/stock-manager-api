import { Controller, Post, Body } from '@nestjs/common';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { CreateRegisterDto } from './dto/create-register.dto';

@Controller('register')
export class RegisterController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) { }

  @Post()
  async create(@Body() createRegisterDto: CreateRegisterDto) {
    return this.registerUserUseCase.execute(createRegisterDto);
  }
}
