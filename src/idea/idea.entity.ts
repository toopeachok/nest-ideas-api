import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { IdeaRO } from './idea.dto';
import { CommentEntity } from '../comment/comment.entity';

@Entity('idea')
export class IdeaEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @CreateDateColumn() created: Date;

  @UpdateDateColumn() updated: Date;

  @Column('text') idea: string;

  @Column('text') description: string;

  @ManyToOne(
    type => UserEntity,
    author => author.ideas,
  )
  author: UserEntity;

  @ManyToMany(type => UserEntity, { cascade: true })
  @JoinTable()
  upvotes: UserEntity[];

  @ManyToMany(type => UserEntity, { cascade: true })
  @JoinTable()
  downvotes: UserEntity[];

  @OneToMany(
    type => CommentEntity,
    comment => comment.idea,
    { cascade: true },
  )
  comments: CommentEntity[];

  toResponseObject(): IdeaRO {
    const responseObject: any = {
      ...this,
      author: this.author ? this.author.toResponseObject() : null,
    };

    if (this.upvotes) {
      responseObject.upvotes = this.upvotes.length;
    }
    if (this.downvotes) {
      responseObject.downvotes = this.downvotes.length;
    }

    return responseObject;
  }
}
