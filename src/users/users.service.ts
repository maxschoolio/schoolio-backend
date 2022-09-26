import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { User } from 'src/users/entities/user.entity';

const users: User[] = [];

@Injectable()
export class UsersService {
  create(createUserInput: CreateUserInput): User {
    users.push({
      id: users.length,
      ...createUserInput,
    });

    return users[users.length - 1];
  }

  findAll(): User[] {
    return users;
  }

  findOne(username: string): User | null {
    return users.find((user) => user.username === username) ?? null;
  }
}
