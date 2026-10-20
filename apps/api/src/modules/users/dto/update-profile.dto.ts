import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCandidateProfileDto {
  @ApiProperty({ example: 'Yassine', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Trabelsi', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: 'Ingénieur Développeur Full-Stack TypeScript', required: false })
  @IsOptional()
  @IsString()
  headline?: string;

  @ApiProperty({ example: '3 ans d\'expérience dans le développement web et mobile.', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  experienceYears?: number;

  @ApiProperty({ example: 2200, required: false })
  @IsOptional()
  @IsInt()
  currentSalary?: number;

  @ApiProperty({ example: 2800, required: false })
  @IsOptional()
  @IsInt()
  expectedSalary?: number;

  @ApiProperty({ example: ['11', '12', '51'], required: false })
  @IsOptional()
  @IsArray()
  preferredGovernorates?: string[];

  @ApiProperty({ example: '/uploads/cv/cv_yassine_trabelsi.pdf', required: false })
  @IsOptional()
  @IsString()
  cvFileUrl?: string;
}

export class CreateExperienceDto {
  @ApiProperty({ example: 'Vermeg Tunisie' })
  @IsString()
  companyName: string;

  @ApiProperty({ example: 'Ingénieur Full-Stack Senior' })
  @IsString()
  roleTitle: string;

  @ApiProperty({ example: 'Les Berges du Lac 2, Tunis', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: '2022-01-01' })
  @IsString()
  startDate: string;

  @ApiProperty({ example: '2024-06-30', required: false })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ example: 'Développement d\'architectures microservices, NestJS, React et Docker.', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateEducationDto {
  @ApiProperty({ example: 'INSAT (Institut National des Sciences Appliquées et de Technologie)' })
  @IsString()
  institution: string;

  @ApiProperty({ example: 'Diplôme National d\'Ingénieur' })
  @IsString()
  degree: string;

  @ApiProperty({ example: 'Génie Logiciel et Systèmes d\'Information' })
  @IsString()
  field: string;

  @ApiProperty({ example: '2017-09-01' })
  @IsString()
  startDate: string;

  @ApiProperty({ example: '2022-06-30', required: false })
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class AddSkillDto {
  @ApiProperty({ example: 'NestJS' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Avancé', required: false })
  @IsOptional()
  @IsString()
  level?: string;
}
