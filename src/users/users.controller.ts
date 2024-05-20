import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { cuidPipe } from '../pipes/cuid.pipe';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password'>> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(): Promise<Omit<User, 'password'>[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', cuidPipe) id: string): Promise<Omit<User, 'password'>> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', cuidPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', cuidPipe) id: string): Promise<Omit<User, 'password'>> {
    return this.usersService.remove(id);
  }
}
