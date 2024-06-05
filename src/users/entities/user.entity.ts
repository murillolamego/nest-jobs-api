import { User } from '@prisma/client';

export class UserEntity implements User {
  id: string;
  email: string;
  password: string;
  displayName: string | null;
  refreshToken: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class UserSanitizedEntity
  implements Omit<User, 'password' | 'refreshToken'>
{
  id: string;
  email: string;
  displayName: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
