import { Job } from '@prisma/client';

export class JobEntity implements Job {
  id: string;
  title: string;
  companyName: string;
  companyWebsite: string;
  about: string;
  location: string;
  locationType: string;
  seniority: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
