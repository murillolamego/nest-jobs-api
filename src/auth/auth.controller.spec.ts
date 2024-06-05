import * as bcrypt from 'bcrypt';

import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';

const testUser = {
  email: 'alice@test.com',
  password: '@Alice123',
};

// const testUsersWithoutPassword = [
//   {
//     id: 'cltjz0s3r000008lcerwyggyb',
//     email: 'alice@test.com',
//     displayName: 'alice test',
//     createdAt: '2024-01-01T01:01:01.000Z',
//     updatedAt: '2024-01-01T01:01:01.000Z',
//     deletedAt: null,
//   },
//   {
//     id: 'cltjzdbi1000008l18pxw8gn2',
//     email: 'bob@test.com',
//     displayName: 'bob test',
//     createdAt: '2024-02-02T02:02:02.000Z',
//     updatedAt: '2024-02-02T02:02:02.000Z',
//     deletedAt: null,
//   },
//   {
//     id: 'cltjzdjp0000108l1hh2ram9u',
//     email: 'charlie@test.com',
//     displayName: 'charlie test',
//     createdAt: '2024-03-03T03:03:03.000Z',
//     updatedAt: '2024-03-03T03:03:03.000Z',
//     deletedAt: null,
//   },
// ];

const testUserWithHashedPassword = {
  id: 'cltjz0s3r000008lcerwyggyb',
  email: 'alice@test.com',
  password: bcrypt.hashSync('@Alice123', 10),
  displayName: 'alice test',
  createdAt: '2024-01-01T01:01:01.000Z',
  updatedAt: '2024-01-01T01:01:01.000Z',
  deletedAt: null,
};

const testService = {
  signIn: jest.fn().mockResolvedValue({ access_token: 'test' }),
};

const testPrisma = {
  user: {
    findUniqueOrThrow: jest.fn().mockResolvedValue(testUserWithHashedPassword),
  },
};

const testJWT = {
  signAsync: jest.fn().mockResolvedValue('test_token'),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: testService },
        { provide: JwtService, useValue: testJWT },
        { provide: PrismaService, useValue: testPrisma },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should check user email/password, signin and return access_token JWT', async () => {
      const response = await controller.signIn(testUser);

      expect(response.accessToken).toBeTruthy();
      expect(service.signIn).toHaveBeenCalledWith(testUser);
    });
  });
});
