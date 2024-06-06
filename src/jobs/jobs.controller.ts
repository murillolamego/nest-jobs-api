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
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Post()
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(createJobDto);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get('title/:title')
  findOneByTitle(@Param('title') title: string) {
    return this.jobsService.findByTitle(title);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get('company-name/:company-name')
  findByCompanyName(@Param('company-name') companyName: string) {
    return this.jobsService.findByCompanyName(companyName);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get('location/:location')
  findByLocation(@Param('location') location: string) {
    return this.jobsService.findByLocation(location);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get('location-type/:location-type')
  findByLocationType(@Param('location-type') locationType: string) {
    return this.jobsService.findByLocationType(locationType);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get('seniority/:seniority')
  findBySeniority(@Param('seniority') seniority: string) {
    return this.jobsService.findBySeniority(seniority);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get('type/:type')
  findByType(@Param('type') type: string) {
    return this.jobsService.findByType(type);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobsService.update(id, updateJobDto);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }
}
