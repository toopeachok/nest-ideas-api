import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './user.dto';
import { ValidationPipe } from '../shared/validation.pipe';

@Controller('api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('')
  showAllUsers() {
    return this.userService.showAll();
  }

  @UsePipes(ValidationPipe)
  @Post('login')
  login(@Body() data: UserDto) {
    return this.userService.login(data);
  }

  @UsePipes(ValidationPipe)
  @Post('register')
  register(@Body() data: UserDto) {
    return this.userService.register(data);
  }
}
