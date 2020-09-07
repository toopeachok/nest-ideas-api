import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IdeaEntity } from './idea.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IdeaDTO, IdeaRO } from './idea.dto';
import { UserEntity } from '../user/user.entity';
import { Votes } from '../shared/votes.enum';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async showAll(page = 1, newest?: boolean): Promise<IdeaRO[]> {
    const ideas = await this.ideaRepository.find({
      relations: ['author', 'downvotes', 'upvotes', 'comments'],
      take: 25,
      skip: 25 * (page - 1),
      order: newest && { created: 'DESC' },
    });

    return ideas.map(idea => idea.toResponseObject());
  }

  async read(id: string): Promise<IdeaRO> {
    const idea = await this.find(id, [
      'author',
      'downvotes',
      'upvotes',
      'comments',
    ]);
    return idea.toResponseObject();
  }

  async create(userID: string, data: IdeaDTO): Promise<IdeaRO> {
    const user = await this.userRepository.findOne({ where: { id: userID } });
    const idea = await this.ideaRepository.create({ ...data, author: user });

    await this.ideaRepository.save(idea);

    return idea.toResponseObject();
  }

  async update(
    id: string,
    userID: string,
    data: Partial<IdeaDTO>,
  ): Promise<IdeaRO> {
    let idea = await this.find(id);

    IdeaService.ensureOwnership(idea, userID);

    await this.ideaRepository.update({ id }, data);

    idea = await this.find(id, ['author', 'downvotes', 'upvotes', 'comments']);

    return idea.toResponseObject();
  }

  async destroy(id: string, userID: string): Promise<IdeaRO> {
    const idea = await this.find(id, [
      'author',
      'downvotes',
      'upvotes',
      'comments',
    ]);

    IdeaService.ensureOwnership(idea, userID);

    await this.ideaRepository.delete({ id });

    return idea.toResponseObject();
  }

  async bookmark(id: string, userID: string) {
    const idea = await this.ideaRepository.findOne({ where: { id } });
    const user = await this.userRepository.findOne({
      where: { id: userID },
      relations: ['bookmarks'],
    });

    if (!user.bookmarks.some(bookmark => bookmark.id === idea.id)) {
      user.bookmarks.push(idea);
      await this.userRepository.save(user);
    } else {
      throw new HttpException(
        'Idea already bookmarked ',
        HttpStatus.BAD_REQUEST,
      );
    }

    return user.toResponseObject();
  }

  async unbookmark(id: string, userID: string) {
    const idea = await this.ideaRepository.findOne({ where: { id } });
    const user = await this.userRepository.findOne({
      where: { id: userID },
      relations: ['bookmarks'],
    });

    if (user.bookmarks.some(bookmark => bookmark.id === idea.id)) {
      user.bookmarks = user.bookmarks.filter(
        bookmark => bookmark.id !== idea.id,
      );
      await this.userRepository.save(user);
    } else {
      throw new HttpException('Cannot remove bookmark', HttpStatus.BAD_REQUEST);
    }

    return user.toResponseObject(false);
  }

  async upvote(id: string, userID: string) {
    let idea = await this.find(id, [
      'author',
      'upvotes',
      'downvotes',
      'comments',
    ]);

    const user = await this.userRepository.findOne({ where: { id: userID } });
    idea = await this.vote(idea, user, Votes.UP);

    return idea.toResponseObject();
  }

  async downvote(id: string, userID: string) {
    let idea = await this.find(id, [
      'author',
      'upvotes',
      'downvotes',
      'comments',
    ]);

    const user = await this.userRepository.findOne({ where: { id: userID } });
    idea = await this.vote(idea, user, Votes.DOWN);

    return idea.toResponseObject();
  }

  async find(
    id: string,
    relations: Array<string> = ['author'],
  ): Promise<IdeaEntity> {
    const idea = await this.ideaRepository.findOne({
      where: { id },
      relations,
    });

    if (!idea) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    return idea;
  }

  private static ensureOwnership(idea: IdeaEntity, userID: string) {
    if (idea.author.id !== userID) {
      throw new HttpException('Incorrect User', HttpStatus.UNAUTHORIZED);
    }
  }

  private async vote(idea: IdeaEntity, user: UserEntity, vote: Votes) {
    const opposite = vote === Votes.UP ? Votes.DOWN : Votes.UP;
    if (
      idea[opposite].some(voter => voter.id === user.id) ||
      idea[vote].some(voter => voter.id === user.id)
    ) {
      idea[opposite] = idea[opposite].filter(voter => voter.id !== user.id);
      idea[vote] = idea[vote].filter(voter => voter.id !== user.id);
      await this.ideaRepository.save(idea);
    } else if (!idea[vote].some(voter => voter.id === user.id)) {
      idea[vote].push(user);
      await this.ideaRepository.save(idea);
    } else {
      throw new HttpException('Unable to cast vote', HttpStatus.BAD_REQUEST);
    }

    return idea;
  }
}
