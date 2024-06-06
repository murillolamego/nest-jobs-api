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
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ParseCUIDPipe } from '../pipes/cuid.pipe';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { UserSanitizedEntity } from './entities/user.entity';
import { Throttle } from '@nestjs/throttler';
import { ParseEmailPipe } from '../pipes/email.pipe';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post()
  @ApiResponse({
    status: 201,
    description: 'the created record',
    type: UserSanitizedEntity,
  })
  @ApiResponse({
    status: 503,
    description: 'the server could not process your request at this moment',
  })
  create(@Body() createUserDto: CreateUserDto): Promise<UserSanitizedEntity> {
    return this.usersService.create(createUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get()
  @ApiResponse({
    status: 200,
    description: 'the found record(s)',
    isArray: true,
    type: UserSanitizedEntity,
  })
  @ApiResponse({
    status: 401,
    description: 'invalid or missing authentication credentials',
  })
  @ApiResponse({
    status: 503,
    description: 'the server could not process your request at this moment',
  })
  findAll(): Promise<UserSanitizedEntity[]> {
    return this.usersService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'the found record',
    type: UserSanitizedEntity,
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
  findOne(
    @Param('id', ParseCUIDPipe) id: string,
  ): Promise<UserSanitizedEntity> {
    return this.usersService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get('email/:email')
  @ApiParam({
    name: 'email',
    required: true,
    description: 'user email',
    schema: { type: 'email' },
  })
  @ApiResponse({
    status: 200,
    description: 'the found record',
    type: UserSanitizedEntity,
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
  findOneByEmail(
    @Param('email', ParseEmailPipe) id: string,
  ): Promise<UserSanitizedEntity> {
    return this.usersService.findOneByEmail(id);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'the updated record',
    type: UserSanitizedEntity,
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
    @Param('id', ParseCUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserSanitizedEntity> {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'the deleted record',
    type: UserSanitizedEntity,
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
  remove(@Param('id', ParseCUIDPipe) id: string): Promise<UserSanitizedEntity> {
    return this.usersService.remove(id);
  }
}
