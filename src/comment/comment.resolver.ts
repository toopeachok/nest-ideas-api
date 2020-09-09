import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CommentService } from './comment.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../shared/auth.guard';
import { CommentDTO } from './comment.dto';

@Resolver()
export class CommentResolver {
  constructor(private commentService: CommentService) {}

  @Query()
  comment(@Args('id') id: string) {
    return this.commentService.show(id);
  }

  @Mutation()
  @UseGuards(AuthGuard)
  createComment(
    @Args('idea') ideaID: string,
    @Args('comment') comment: string,
    @Context('user') user,
  ) {
    const data: CommentDTO = { comment };
    const { id: userID } = user;

    return this.commentService.create(ideaID, userID, data);
  }

  @Mutation()
  @UseGuards(AuthGuard)
  deleteComment(@Args('id') id: string, @Context('user') user) {
    const { id: userID } = user;

    return this.commentService.destroy(id, userID);
  }
}
