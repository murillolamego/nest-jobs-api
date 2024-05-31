import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { PrismaService } from '../database/prisma.service';
import { Job, Prisma } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createJobDto: CreateJobDto): Promise<Job> {
    try {
      const job = await this.prisma.job.create({
        data: createJobDto,
      });

      return job;
    } catch (error) {
      throw new ServiceUnavailableException('job creation on database failed');
    }
  }

  async findAll(): Promise<Omit<Job, 'password'>[]> {
    try {
      const jobs = await this.prisma.job.findMany({
        where: {
          deletedAt: null,
        },
      });

      return jobs;
    } catch (error) {
      throw new ServiceUnavailableException(
        'fetching jobs from database failed',
      );
    }
  }

  async findOne(id: string): Promise<Omit<Job, 'password'>> {
    try {
      const job = await this.prisma.job.findUniqueOrThrow({
        where: {
          id,
          deletedAt: null,
        },
      });

      return job;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`job with id ${id} not found`);
        }
      }
      throw new ServiceUnavailableException(
        'fetching job from database failed',
      );
    }
  }

  async update(
    id: string,
    updateJobDto: UpdateJobDto,
  ): Promise<Omit<Job, 'password'>> {
    try {
      const updatedJob = await this.prisma.job.update({
        where: {
          id,
          deletedAt: null,
        },
        data: updateJobDto,
      });

      return updatedJob;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`job with id ${id} not found`);
        }
      }
      throw new ServiceUnavailableException('updating job on database failed');
    }
  }

  async remove(id: string): Promise<Omit<Job, 'password'>> {
    try {
      const deletedJob = await this.prisma.job.delete({
        where: {
          id,
          deletedAt: null,
        },
      });

      return deletedJob;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`job with id ${id} not found`);
        }
      }
      throw new ServiceUnavailableException('removing job on database failed');
    }
  }
}
