import { Test, TestingModule } from '@nestjs/testing';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const testUsers = [
  {
    id: 'cltjz0s3r000008lcerwyggyb',
    email: 'alice@test.com',
    password: '@Alice123',
    displayName: 'alice test',
    createdAt: '2024-01-01T01:01:01.000Z',
    updatedAt: '2024-01-01T01:01:01.000Z',
    deletedAt: null,
  },
  {
    id: 'cltjzdbi1000008l18pxw8gn2',
    email: 'bob@test.com',
    password: '@Bob123',
    displayName: 'bob test',
    createdAt: '2024-02-02T02:02:02.000Z',
    updatedAt: '2024-02-02T02:02:02.000Z',
    deletedAt: null,
  },
  {
    id: 'cltjzdjp0000108l1hh2ram9u',
    email: 'charlie@test.com',
    password: '@Charlie123',
    displayName: 'charlie test',
    createdAt: '2024-03-03T03:03:03.000Z',
    updatedAt: '2024-03-03T03:03:03.000Z',
    deletedAt: null,
  },
];

const testUsersWithoutPassword = [
  {
    id: 'cltjz0s3r000008lcerwyggyb',
    email: 'alice@test.com',
    displayName: 'alice test',
    createdAt: '2024-01-01T01:01:01.000Z',
    updatedAt: '2024-01-01T01:01:01.000Z',
    deletedAt: null,
  },
  {
    id: 'cltjzdbi1000008l18pxw8gn2',
    email: 'bob@test.com',
    displayName: 'bob test',
    createdAt: '2024-02-02T02:02:02.000Z',
    updatedAt: '2024-02-02T02:02:02.000Z',
    deletedAt: null,
  },
  {
    id: 'cltjzdjp0000108l1hh2ram9u',
    email: 'charlie@test.com',
    displayName: 'charlie test',
    createdAt: '2024-03-03T03:03:03.000Z',
    updatedAt: '2024-03-03T03:03:03.000Z',
    deletedAt: null,
  },
];

const testService = {
  findAll: jest.fn().mockResolvedValue(testUsersWithoutPassword),
  findOne: jest.fn().mockReturnValue(testUsersWithoutPassword[0]),
  create: jest.fn().mockReturnValue(testUsersWithoutPassword[0]),
  update: jest.fn().mockReturnValue(testUsersWithoutPassword[0]),
  remove: jest.fn().mockReturnValue(testUsersWithoutPassword[0]),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: testService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a user and return', async () => {
      const response = await controller.create(testUsers[0]);

      expect(service.create).toHaveBeenCalledWith(testUsers[0]);
      expect(response).toStrictEqual(testUsersWithoutPassword[0]);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const response = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(response).toStrictEqual(testUsersWithoutPassword);
    });
  });

  describe('findOne', () => {
    it('should return one user', async () => {
      const response = await controller.findOne(testUsers[0].id);

      expect(service.findOne).toHaveBeenCalledWith(testUsers[0].id);
      expect(response).toStrictEqual(testUsersWithoutPassword[0]);
    });
  });

  describe('update', () => {
    it('should update an user', async () => {
      const response = await controller.update(testUsers[0].id, testUsers[0]);

      expect(service.update).toHaveBeenCalledWith(
        testUsers[0].id,
        testUsers[0],
      );
      expect(response).toStrictEqual(testUsersWithoutPassword[0]);
    });
  });

  describe('remove', () => {
    it('should remove an user', async () => {
      const response = await controller.remove(testUsers[0].id);

      expect(service.remove).toHaveBeenCalledWith(testUsers[0].id);
      expect(response).toStrictEqual(testUsersWithoutPassword[0]);
    });
  });
});
