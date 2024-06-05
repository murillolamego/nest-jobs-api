import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import {
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const testUser = {
  email: 'alice@test.com',
  password: '@Alice123',
};

const testUserWithHashedPassword = {
  id: 'cltjz0s3r000008lcerwyggyb',
  email: 'alice@test.com',
  password: bcrypt.hashSync('@Alice123', 10),
  displayName: 'alice test',
  createdAt: '2024-01-01T01:01:01.000Z',
  updatedAt: '2024-01-01T01:01:01.000Z',
  deletedAt: null,
};

const notTestUser = {
  id: 'cltjzwp2d000308l025jw30ne',
  email: 'dave@test.com',
  password: '@Dave123',
  displayName: 'dave test',
  createdAt: '2024-03-03T03:03:03.000Z',
  updatedAt: '2024-03-03T03:03:03.000Z',
  deletedAt: null,
};

const testPrisma = {
  user: {
    findUniqueOrThrow: jest.fn().mockResolvedValue(testUserWithHashedPassword),
  },
};

const testJWT = {
  signAsync: jest.fn().mockResolvedValue('test_token'),
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: testJWT },
        { provide: PrismaService, useValue: testPrisma },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should return the access_token for the user', async () => {
      const response = await service.signIn(testUser);

      expect(response.accessToken).toBeTruthy();
      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          email: testUser.email,
        },
      });
      expect(jwt.signAsync).toHaveBeenCalledTimes(1);
    });

    it('should return UnauthorizedException when provided invalid credentials', async () => {
      try {
        await service.signIn({
          email: notTestUser.email,
          password: notTestUser.password,
        });
      } catch (error) {
        expect(error).toEqual(
          new UnauthorizedException(
            'invalid credentials provided, please try again',
          ),
        );
      }

      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          email: notTestUser.email,
        },
      });
      expect(jwt.signAsync).toHaveBeenCalledTimes(0);
    });

    it('should return NotFoundException when the user email does not exist', async () => {
      jest.spyOn(prisma.user, 'findUniqueOrThrow').mockRejectedValue(
        new PrismaClientKnownRequestError('teste', {
          code: 'P2025',
          clientVersion: '5.10.2',
          meta: { modelName: 'User', cause: 'record to update not found.' },
        }),
      );

      try {
        await service.signIn(testUser);
      } catch (error) {
        expect(error).toEqual(
          new NotFoundException(`user with email ${testUser.email} not found`),
        );
      }

      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          email: testUser.email,
        },
      });
      expect(jwt.signAsync).toHaveBeenCalledTimes(0);
    });

    it('should return ServiceUnavailableException when theres a generic DB error', async () => {
      jest
        .spyOn(prisma.user, 'findUniqueOrThrow')
        .mockRejectedValue(new Error());

      try {
        await service.signIn(testUser);
      } catch (error) {
        expect(error).toEqual(new InternalServerErrorException());
      }

      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          email: testUser.email,
        },
      });
      expect(jwt.signAsync).toHaveBeenCalledTimes(0);
    });
  });
});
