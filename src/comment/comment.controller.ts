import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthGuard } from '../shared/auth.guard';
import { ValidationPipe } from '../shared/validation.pipe';
import { User } from '../user/user.decorator';
import { CommentDTO } from './comment.dto';

@Controller('api/comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get('idea/:id')
  showCommentsByIdea(@Param('id') idea: string) {
    return this.commentService.showByIdea(idea);
  }

  @Get('user/:id')
  showCommentsByUser(@Param('id') user: string) {
    return this.commentService.showByUser(user);
  }

  @Get(':id')
  showComment(@Param('id') id: string) {
    return this.commentService.show(id);
  }

  @Post('idea/:id')
  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  createComment(
    @Param('id') idea: string,
    @User('id') user: string,
    @Body() data: CommentDTO,
  ) {
    return this.commentService.create(idea, user, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  destroyComment(@Param('id') idea: string, @User('id') user: string) {
    return this.commentService.destroy(idea, user);
  }
}
