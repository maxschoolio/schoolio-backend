import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SignInOutput } from 'src/auth/dto/sign-in.output';
import { User } from 'src/users/entities/user.entity';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { SignUpInput } from 'src/auth/dto/sign-up.input';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/environment.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}

  private signToken(user: User, options?: JwtSignOptions) {
    return this.jwtService.sign(
      {
        username: user.username,
        sub: user.id,
      },
      options,
    );
  }

  private getTokens(user: User) {
    const accessExpiresIn = this.configService.get<string>(
      'ACCESS_TOKEN_EXPIRATION',
    );
    const accessSecret = this.configService.get<string>('ACCESS_TOKEN_SECRET');

    const refreshExpiresIn = this.configService.get<string>(
      'REFRESH_TOKEN_EXPIRATION',
    );
    const refreshSecret = this.configService.get<string>(
      'REFRESH_TOKEN_SECRET',
    );

    return {
      accessToken: this.signToken(user, {
        expiresIn: accessExpiresIn,
        secret: accessSecret,
      }),
      refreshToken: this.signToken(user, {
        expiresIn: refreshExpiresIn,
        secret: refreshSecret,
      }),
    };
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOne(username);

    if (!bcrypt.compareSync(password, user?.password ?? '')) {
      return null;
    }

    return user ?? null;
  }

  async login(user: User): Promise<SignInOutput> {
    const { accessToken, refreshToken } = this.getTokens(user);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async signUp({ username, password }: SignUpInput): Promise<User> {
    const user = await this.usersService.findOne(username);

    if (user) {
      throw new Error('User already exists');
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    return this.usersService.create({
      username,
      password: hashedPassword,
    });
  }

  async refresh(username: string): Promise<SignInOutput> {
    const user = await this.usersService.findOne(username);

    if (!user) {
      throw new NotFoundException();
    }

    const { accessToken, refreshToken } = this.getTokens(user);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }
}
