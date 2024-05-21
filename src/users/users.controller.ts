import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { cuidPipe } from '../pipes/cuid.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserWithoutPasswordEntity } from './entities/user.entity';
import { Throttle } from '@nestjs/throttler';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post()
  @ApiResponse({
    status: 201,
    description: 'the created record',
    type: UserWithoutPasswordEntity,
  })
  @ApiResponse({
    status: 503,
    description: 'the server could not process your request at this moment',
  })
  create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password'>> {
    return this.usersService.create(createUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiResponse({
    status: 200,
    description: 'the found record(s)',
    isArray: true,
    type: UserWithoutPasswordEntity,
  })
  @ApiResponse({
    status: 401,
    description: 'invalid or missing authentication credentials',
  })
  @ApiResponse({
    status: 503,
    description: 'the server could not process your request at this moment',
  })
  findAll(): Promise<Omit<User, 'password'>[]> {
    return this.usersService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'the found record',
    type: UserWithoutPasswordEntity,
  })
  @ApiResponse({
    status: 401,
    description: 'invalid or missing authentication credentials',
  })
  @ApiResponse({ status: 404, description: 'Record not found' })
  @ApiResponse({
    status: 503,
    description: 'the server could not process your request at this moment',
  })
  findOne(@Param('id', cuidPipe) id: string): Promise<Omit<User, 'password'>> {
    return this.usersService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'the updated record',
    type: UserWithoutPasswordEntity,
  })
  @ApiResponse({
    status: 401,
    description: 'invalid or missing authentication credentials',
  })
  @ApiResponse({
    status: 403,
    description: 'you are not authorized for this operation',
  })
  @ApiResponse({ status: 404, description: 'Record not found' })
  @ApiResponse({
    status: 503,
    description: 'the server could not process your request at this moment',
  })
  update(
    @Param('id', cuidPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'the deleted record',
    type: UserWithoutPasswordEntity,
  })
  @ApiResponse({
    status: 401,
    description: 'invalid or missing authentication credentials',
  })
  @ApiResponse({
    status: 403,
    description: 'you are not authorized for this operation',
  })
  @ApiResponse({ status: 404, description: 'Record not found' })
  @ApiResponse({
    status: 503,
    description: 'the server could not process your request at this moment',
  })
  remove(@Param('id', cuidPipe) id: string): Promise<Omit<User, 'password'>> {
    return this.usersService.remove(id);
  }
}
