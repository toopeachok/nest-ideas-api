import { IsNotEmpty, IsString } from 'class-validator';
import { IdeaEntity } from '../idea/idea.entity';

export class UserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class UserRO {
  id: string;
  username: string;
  created: Date;
  token?: string;
  ideas?: IdeaEntity[];
  bookmarks?: IdeaEntity[];
}
