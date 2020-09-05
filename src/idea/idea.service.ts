import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IdeaEntity } from './idea.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IdeaDTO, IdeaRO } from './idea.dto';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async showAll(): Promise<IdeaRO[]> {
    const ideas = await this.ideaRepository.find({
      relations: ['author'],
    });

    return ideas.map(idea => idea.toResponseObject());
  }

  async read(id: string): Promise<IdeaRO> {
    return await this.find(id);
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
    const idea = await this.find(id);

    IdeaService.ensureOwnership(idea, userID);

    await this.ideaRepository.update({ id }, data);

    return await this.find(id);
  }

  async destroy(id: string, userID: string): Promise<IdeaRO> {
    const idea = await this.find(id);

    IdeaService.ensureOwnership(idea, userID);

    await this.ideaRepository.delete({ id });

    return idea;
  }

  async find(id: string): Promise<IdeaRO> {
    const idea = await this.ideaRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!idea) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    return idea.toResponseObject();
  }

  private static ensureOwnership(idea: IdeaRO, userID: string) {
    if (idea.author.id !== userID) {
      throw new HttpException('Incorrect User', HttpStatus.UNAUTHORIZED);
    }
  }
}
