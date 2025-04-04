import { Controller, Post, Body, Logger, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorators';

@Controller('login')
export class AuthController {
  private logger = new Logger('Auth Controller');
  constructor(private readonly authService: AuthService) { }

  @Post()
  loging(@Body() createAuthDto: CreateAuthDto) {
    this.logger.debug("controllrt auth");
    return this.authService.login(createAuthDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingProtected(
    @GetUser() user
  ) {
    return {
      ok: true,
      message: "hola mundo private"
    }
  }
}
