import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveProperty,
  Resolver,
} from '@nestjs/graphql';
import { IdeaService } from './idea.service';
import { CommentService } from '../comment/comment.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../shared/auth.guard';
import { IdeaDTO } from './idea.dto';

@Resolver()
export class IdeaResolver {
  constructor(
    private ideaService: IdeaService,
    private commentService: CommentService,
  ) {}

  @Query()
  ideas(@Args('page') page: number, @Args('newest') newest: boolean) {
    return this.ideaService.showAll(page, newest);
  }

  @Query()
  idea(@Args('id') id: string) {
    return this.ideaService.read(id);
  }

  @ResolveProperty()
  comments(@Parent() idea) {
    const { id } = idea;
    return this.commentService.showByIdea(id);
  }

  @Mutation()
  @UseGuards(AuthGuard)
  createIdea(
    @Args('idea') idea: string,
    @Args('description') description: string,
    @Context('user') user,
  ) {
    const data: IdeaDTO = { idea, description };
    const { id: userID } = user;

    return this.ideaService.create(userID, data);
  }

  @Mutation()
  @UseGuards(AuthGuard)
  updateIdea(
    @Args('id') id: string,
    @Args('idea') idea: string,
    @Args('description') description: string,
    @Context('user') user,
  ) {
    const data: IdeaDTO = { idea, description };
    const { id: userID } = user;

    return this.ideaService.update(id, userID, data);
  }

  @Mutation()
  @UseGuards(AuthGuard)
  deleteIdea(@Args('id') id: string, @Context('user') user) {
    const { id: userID } = user;

    return this.ideaService.destroy(id, userID);
  }

  @Mutation()
  @UseGuards(AuthGuard)
  upvote(@Args('id') id: string, @Context('user') user) {
    const { id: userID } = user;

    return this.ideaService.upvote(id, userID);
  }

  @Mutation()
  @UseGuards(AuthGuard)
  downvote(@Args('id') id: string, @Context('user') user) {
    const { id: userID } = user;

    return this.ideaService.downvote(id, userID);
  }

  @Mutation()
  @UseGuards(AuthGuard)
  bookmark(@Args('id') id: string, @Context('user') user) {
    const { id: userID } = user;

    return this.ideaService.bookmark(id, userID);
  }

  @Mutation()
  @UseGuards(AuthGuard)
  unbookmark(@Args('id') id: string, @Context('user') user) {
    const { id: userID } = user;

    return this.ideaService.unbookmark(id, userID);
  }
}
