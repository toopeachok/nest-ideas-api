import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { IdeaService } from './idea.service';
import { IdeaDTO } from './idea.dto';
import { ValidationPipe } from '../shared/validation.pipe';
import { AuthGuard } from '../shared/auth.guard';
import { User } from '../user/user.decorator';

@Controller('api/ideas')
export class IdeaController {
  constructor(private ideaService: IdeaService) {}

  @Get()
  showAllIdeas() {
    return this.ideaService.showAll();
  }

  @Get(':id')
  readIdea(@Param('id') id: string) {
    return this.ideaService.read(id);
  }

  @UsePipes(ValidationPipe)
  @Post()
  @UseGuards(AuthGuard)
  createIdea(@User('id') user, @Body() data: IdeaDTO) {
    return this.ideaService.create(user, data);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  updateIdea(
    @Param('id') id: string,
    @User('id') user,
    @Body() data: Partial<IdeaDTO>,
  ) {
    return this.ideaService.update(id, user, data);
  }

  @Delete(':id')
  destroyIdea(@Param('id') id: string, @User('id') user) {
    return this.ideaService.destroy(id, user);
  }
}
