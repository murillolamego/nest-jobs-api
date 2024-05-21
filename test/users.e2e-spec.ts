import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../src/database/prisma.module';
import { UsersModule } from '../src/users/users.module';
import { AppModule } from '../src/app.module';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaService } from '../src/database/prisma.service';

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
];

const testUsersWithHashedPassword = [
  {
    id: 'cltjz0s3r000008lcerwyggyb',
    email: 'alice@test.com',
    password: bcrypt.hashSync('@Alice123', 10),
    displayName: 'alice test',
    createdAt: '2024-01-01T01:01:01.000Z',
    updatedAt: '2024-01-01T01:01:01.000Z',
    deletedAt: null,
  },
  {
    id: 'cltjzdbi1000008l18pxw8gn2',
    email: 'bob@test.com',
    password: bcrypt.hashSync('@Bob123', 10),
    displayName: 'bob test',
    createdAt: '2024-02-02T02:02:02.000Z',
    updatedAt: '2024-02-02T02:02:02.000Z',
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
];

const newTestUser = {
  id: 'cltjzdjp0000108l1hh2ram9u',
  email: 'charlie@test.com',
  password: '@Charlie123',
  displayName: 'charlie test',
  createdAt: '2024-03-03T03:03:03.000Z',
  updatedAt: '2024-03-03T03:03:03.000Z',
  deletedAt: null,
};

const newTestUserWithoutPassword = {
  id: 'cltjzdjp0000108l1hh2ram9u',
  email: 'charlie@test.com',
  displayName: 'charlie test',
  createdAt: '2024-03-03T03:03:03.000Z',
  updatedAt: '2024-03-03T03:03:03.000Z',
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

const updatedTestUser = {
  id: 'cltjzdbi1000008l18pxw8gn2',
  email: 'updated1',
  password: 'updated2',
  displayName: 'updated4',
  createdAt: '2024-02-02T02:02:02.000Z',
  updatedAt: '2024-02-02T02:02:02.000Z',
  deletedAt: null,
};

const updatedTestUserWithoutPassword = {
  id: 'cltjzdbi1000008l18pxw8gn2',
  email: 'updated1',
  displayName: 'updated4',
  createdAt: '2024-02-02T02:02:02.000Z',
  updatedAt: '2024-02-02T02:02:02.000Z',
  deletedAt: null,
};

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env.test'],
          isGlobal: true,
          cache: false,
          expandVariables: true,
        }),
        AppModule,
        AuthModule,
        PrismaModule,
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    await app.init();
    await prisma.$executeRaw`TRUNCATE "public"."User" RESTART IDENTITY CASCADE;`;

    await prisma.user.createMany({
      data: testUsersWithHashedPassword,
    });

    const createdUsers = await prisma.user.findMany();
    console.log('Test Users created: ', createdUsers);
  });

  it('/users (POST) should return the created user', async () => {
    return request(app.getHttpServer())
      .post('/users')
      .send(newTestUser)
      .expect(HttpStatus.CREATED)
      .expect(newTestUserWithoutPassword);
  });

  it('/users (GET) unauthenticated should return unauthorized', async () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('/users (GET) authenticated should return all users', async () => {
    const {
      body: { access_token },
    } = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email: testUsers[0].email, password: testUsers[0].password });

    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(HttpStatus.OK)
      .expect([...testUsersWithoutPassword, newTestUserWithoutPassword]);
  });

  it('/users/{userId} (GET) unauthenticated should return unauthorized', async () => {
    return request(app.getHttpServer())
      .get(`/users/${testUsers[0].id}`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('/users/{userId} (GET) authenticated should return a single user with the given id', async () => {
    const {
      body: { access_token },
    } = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email: testUsers[0].email, password: testUsers[0].password });

    return request(app.getHttpServer())
      .get(`/users/${testUsers[0].id}`)
      .set('Authorization', `Bearer ${access_token}`)
      .expect(HttpStatus.OK)
      .expect(testUsersWithoutPassword[0]);
  });

  it('/users/{userId} (GET) authenticated should not find unexinsting user', async () => {
    const {
      body: { access_token },
    } = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email: testUsers[0].email, password: testUsers[0].password });

    return request(app.getHttpServer())
      .get(`/users/${notTestUser.id}`)
      .set('Authorization', `Bearer ${access_token}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/users/{userId} (PATCH) unauthenticated should return unauthorized', async () => {
    return request(app.getHttpServer())
      .patch(`/users/${testUsers[1].id}`)
      .send(updatedTestUser)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('/users/{userId} (PATCH) authenticated should return an updated user with the given id', async () => {
    const {
      body: { access_token },
    } = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email: testUsers[1].email, password: testUsers[1].password });

    return request(app.getHttpServer())
      .patch(`/users/${testUsers[1].id}`)
      .set('Authorization', `Bearer ${access_token}`)
      .send(updatedTestUser)
      .expect(HttpStatus.OK)
      .expect(updatedTestUserWithoutPassword);
  });

  it('/users/{userId} (DELETE) unauthenticated should return the deleted user with the given id', async () => {
    return request(app.getHttpServer())
      .delete(`/users/${testUsers[0].id}`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('/users/{userId} (DELETE) authenticated should return the deleted user with the given id', async () => {
    const {
      body: { access_token },
    } = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email: testUsers[0].email, password: testUsers[0].password });

    return request(app.getHttpServer())
      .delete(`/users/${testUsers[0].id}`)
      .set('Authorization', `Bearer ${access_token}`)
      .expect(HttpStatus.OK)
      .expect(testUsersWithoutPassword[0]);
  });

  afterAll(async () => {
    await prisma.$executeRaw`TRUNCATE "public"."User" RESTART IDENTITY CASCADE;`;
    await app.close();
  });
});
