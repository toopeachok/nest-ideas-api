import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IdeaEntity } from './idea.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IdeaDto } from './idea.dto';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
  ) {}

  async showAll() {
    return await this.ideaRepository.find();
  }

  async read(id: string) {
    return await this.find(id);
  }

  async create(data: IdeaDto) {
    const idea = await this.ideaRepository.create(data);

    await this.ideaRepository.save(idea);

    return idea;
  }

  async update(id: string, data: Partial<IdeaDto>) {
    await this.find(id);

    await this.ideaRepository.update({ id }, data);

    return await this.ideaRepository.findOne({ id });
  }

  async destroy(id: string) {
    const idea = await this.find(id);

    await this.ideaRepository.delete({ id });

    return idea;
  }

  async find(id: string) {
    const idea = await this.ideaRepository.findOne({ id });

    if (!idea) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    return idea;
  }
}
