import * as bcrypt from 'bcrypt';

import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService, exclude } from '../database/prisma.service';
import { Prisma, User } from '@prisma/client';
import { UserSanitizedEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserSanitizedEntity> {
    try {
      createUserDto.password = await bcrypt.hash(createUserDto.password, 10);

      const user = await this.prisma.user.create({
        data: createUserDto,
      });
      const userSanitized = exclude(user, ['password', 'refreshToken']);

      return userSanitized;
    } catch (error) {
      throw new ServiceUnavailableException('user creation on database failed');
    }
  }

  async findAll(): Promise<UserSanitizedEntity[]> {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          deletedAt: null,
        },
      });

      const usersSanitized = users.map((user) => {
        return exclude(user, ['password', 'refreshToken']);
      });

      return usersSanitized;
    } catch (error) {
      throw new ServiceUnavailableException(
        'fetching users from database failed',
      );
    }
  }

  async findOne(id: string): Promise<UserSanitizedEntity> {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: {
          id,
          deletedAt: null,
        },
      });
      const userSanitized = exclude(user, ['password', 'refreshToken']);

      return userSanitized;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`user with id ${id} not found`);
        }
      }
      throw new ServiceUnavailableException(
        'fetching user from database failed',
      );
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    try {
      const updatedUser = await this.prisma.user.update({
        where: {
          id,
          deletedAt: null,
        },
        data: updateUserDto,
      });
      const updatedUserSanitized = exclude(updatedUser, ['password']);

      return updatedUserSanitized;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`user with id ${id} not found`);
        }
      }
      throw new ServiceUnavailableException('updating user on database failed');
    }
  }

  async remove(id: string): Promise<Omit<User, 'password'>> {
    try {
      const deletedUser = await this.prisma.user.delete({
        where: {
          id,
          deletedAt: null,
        },
      });

      const deletedUserSanitized = exclude(deletedUser, ['password']);

      return deletedUserSanitized;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`user with id ${id} not found`);
        }
      }
      throw new ServiceUnavailableException('removing user on database failed');
    }
  }

  async unsafeFindOneById(id: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: {
          id,
          deletedAt: null,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`user with id ${id} not found`);
        }
      }
      throw new ServiceUnavailableException(
        'fetching user from database failed',
      );
    }
  }
}
