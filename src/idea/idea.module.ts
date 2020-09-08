import { Module } from '@nestjs/common';
import { IdeaController } from './idea.controller';
import { IdeaService } from './idea.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdeaEntity } from './idea.entity';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '../shared/validation.pipe';
import { UserEntity } from '../user/user.entity';
import { IdeaResolver } from './idea.resolver';
import { CommentEntity } from '../comment/comment.entity';
import { CommentService } from '../comment/comment.service';

@Module({
  imports: [TypeOrmModule.forFeature([IdeaEntity, UserEntity, CommentEntity])],
  controllers: [IdeaController],
  providers: [
    IdeaService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    IdeaResolver,
    CommentService,
  ],
})
export class IdeaModule {}
