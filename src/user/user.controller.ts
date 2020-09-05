import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
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

  @Post('login')
  @UsePipes(ValidationPipe)
  login(@Body() data: UserDto) {
    return this.userService.login(data);
  }

  @Post('register')
  @UsePipes(ValidationPipe)
  register(@Body() data: UserDto) {
    return this.userService.register(data);
  }
}
