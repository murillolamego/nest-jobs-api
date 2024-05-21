import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { PrismaService } from '../database/prisma.service';
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
    create: jest.fn().mockReturnValue(testUsersWithoutPassword[0]),
    findMany: jest.fn().mockResolvedValue(testUsersWithoutPassword),
    findUniqueOrThrow: jest.fn().mockResolvedValue(testUsersWithoutPassword[0]),
    update: jest.fn().mockResolvedValue(testUsersWithoutPassword[0]),
    delete: jest.fn().mockResolvedValue(testUsersWithoutPassword[0]),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: testPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const response = await service.create(testUsers[0]);

      expect(response).toStrictEqual(testUsersWithoutPassword[0]);
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: testUsers[0],
      });
    });

    it('should return ServiceUnavailableException when theres a generic DB error', async () => {
      jest.spyOn(prisma.user, 'create').mockRejectedValue(new Error());

      try {
        await service.create(testUsers[0]);
      } catch (error) {
        expect(error).toEqual(
          new ServiceUnavailableException('user creation on database failed'),
        );
      }

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: testUsers[0],
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const response = await service.findAll();

      expect(response).toStrictEqual(testUsersWithoutPassword);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
    });

    it('should return ServiceUnavailableException when theres a generic DB error', async () => {
      jest.spyOn(prisma.user, 'findMany').mockRejectedValue(new Error());

      try {
        await service.findAll();
      } catch (error) {
        expect(error).toEqual(
          new ServiceUnavailableException(
            'fetching users from database failed',
          ),
        );
      }

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const response = await service.findOne(testUsers[0].id);

      expect(response).toStrictEqual(testUsersWithoutPassword[0]);
      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: testUsersWithoutPassword[0].id, deletedAt: null },
      });
    });

    it('should return NotFoundException when user is not found', async () => {
      jest.spyOn(prisma.user, 'findUniqueOrThrow').mockRejectedValue(
        new PrismaClientKnownRequestError('teste', {
          code: 'P2025',
          clientVersion: '5.10.2',
          meta: { modelName: 'User', cause: 'record to update not found.' },
        }),
      );

      try {
        await service.findOne(notTestUser.id);
      } catch (error) {
        expect(error).toStrictEqual(
          new NotFoundException(`user with id ${notTestUser.id} not found`),
        );
      }

      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: notTestUser.id, deletedAt: null },
      });
    });

    it('should return ServiceUnavailableException when theres a generic DB error', async () => {
      jest
        .spyOn(prisma.user, 'findUniqueOrThrow')
        .mockRejectedValue(new Error());

      try {
        await service.findOne(notTestUser.id);
      } catch (error) {
        expect(error).toEqual(
          new ServiceUnavailableException('fetching user from database failed'),
        );
      }

      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: notTestUser.id, deletedAt: null },
      });
    });
  });

  describe('updateOne', () => {
    it('should update an user', async () => {
      const response = await service.update(testUsers[0].id, testUsers[0]);

      expect(response).toStrictEqual(testUsersWithoutPassword[0]);
      expect(prisma.user.update).toHaveBeenCalledTimes(1);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: testUsers[0].id, deletedAt: null },
        data: testUsers[0],
      });
    });

    it('should return NotFoundException when no user is found', async () => {
      jest.spyOn(prisma.user, 'update').mockRejectedValue(
        new PrismaClientKnownRequestError('teste', {
          code: 'P2025',
          clientVersion: '5.10.2',
          meta: { modelName: 'User', cause: 'record to update not found.' },
        }),
      );

      try {
        await service.update(notTestUser.id, notTestUser);
      } catch (error) {
        expect(error).toStrictEqual(
          new NotFoundException(`user with id ${notTestUser.id} not found`),
        );
      }

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: notTestUser.id, deletedAt: null },
        data: notTestUser,
      });
    });

    it('should return ServiceUnavailableException when theres a generic DB error', async () => {
      jest.spyOn(prisma.user, 'update').mockRejectedValue(new Error());

      try {
        await service.update(notTestUser.id, notTestUser);
      } catch (error) {
        expect(error).toEqual(
          new ServiceUnavailableException('updating user on database failed'),
        );
      }

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: notTestUser.id, deletedAt: null },
        data: notTestUser,
      });
    });
  });

  describe('deleteOne', () => {
    it('should delete user and return deleted user body', async () => {
      expect(await service.remove(testUsers[0].id)).toStrictEqual(
        testUsersWithoutPassword[0],
      );
      expect(prisma.user.delete).toHaveBeenCalledTimes(1);
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: testUsers[0].id, deletedAt: null },
      });
    });

    it('should return NotFoundException if user does not exist', async () => {
      jest.spyOn(prisma.user, 'delete').mockRejectedValue(
        new PrismaClientKnownRequestError('teste', {
          code: 'P2025',
          clientVersion: '5.10.2',
          meta: { modelName: 'User', cause: 'record to update not found.' },
        }),
      );

      try {
        await service.remove(notTestUser.id);
      } catch (error) {
        expect(error).toStrictEqual(
          new NotFoundException(`user with id ${notTestUser.id} not found`),
        );
      }

      expect(prisma.user.delete).toHaveBeenCalledTimes(1);
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: notTestUser.id, deletedAt: null },
      });
    });

    it('should return ServiceUnavailableException when theres a generic DB error', async () => {
      jest.spyOn(prisma.user, 'delete').mockRejectedValue(new Error());

      try {
        await service.remove(notTestUser.id);
      } catch (error) {
        expect(error).toEqual(
          new ServiceUnavailableException('removing user on database failed'),
        );
      }

      expect(prisma.user.delete).toHaveBeenCalledTimes(1);
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: notTestUser.id, deletedAt: null },
      });
    });
  });
});
