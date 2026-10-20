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
