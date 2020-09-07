import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from './comment.entity';
import { Repository } from 'typeorm';
import { IdeaEntity } from '../idea/idea.entity';
import { UserEntity } from '../user/user.entity';
import { CommentDTO } from './comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async show(id: string) {
    return await this.commentRepository.findOne({
      where: { id },
      relations: ['author', 'idea'],
    });
  }

  async showByIdea(id: string) {
    const idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['comments', 'comments.author', 'comments.idea'],
    });

    return idea.comments.map(idea => idea.toResponseObject());
  }

  async showByUser(id: string) {
    const comments = await this.commentRepository.find({
      where: { author: { id } },
      relations: ['author'],
    });

    return comments.map(idea => idea.toResponseObject());
  }

  async create(ideaID: string, userID: string, data: CommentDTO) {
    const idea = await this.ideaRepository.findOne({
      where: { id: ideaID },
    });

    const user = await this.userRepository.findOne({
      where: { id: userID },
    });

    const comment = await this.commentRepository.create({
      ...data,
      idea,
      author: user,
    });

    await this.commentRepository.save(comment);

    return comment.toResponseObject();
  }

  async destroy(id: string, userID: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author', 'idea'],
    });

    if (comment.author.id !== userID) {
      throw new HttpException(
        'You do not own this comment',
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.commentRepository.remove(comment);

    return comment.toResponseObject();
  }
}
