import { IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @MinLength(3)
  @MaxLength(40)
  title: string;

  @IsString()
  @MinLength(2)
  @MaxLength(40)
  companyName: string;

  @IsUrl()
  companyWebsite: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1024)
  about: string;

  @IsString()
  @MinLength(3)
  @MaxLength(40)
  location: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  locationType: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  seniority: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  type: string;
}
