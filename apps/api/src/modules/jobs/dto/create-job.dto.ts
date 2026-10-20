import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsArray,
} from 'class-validator';
import { ContractType, WorkMode, OfferStatus } from '@prisma/client';

export class CreateJobDto {
  @ApiProperty({ example: 'Développeur Full-Stack NestJS & React' })
  @IsString()
  @IsNotEmpty({ message: 'Le titre de l\'offre est obligatoire' })
  title: string;

  @ApiProperty({ example: 'Nous recrutons un ingénieur passionné pour concevoir nos plateformes web...' })
  @IsString()
  @IsNotEmpty({ message: 'La description du poste est obligatoire' })
  description: string;

  @ApiProperty({ example: 'TypeScript, NestJS, PostgreSQL, Docker, bonne autonomie.' })
  @IsString()
  @IsNotEmpty({ message: 'Les prérequis sont obligatoires' })
  requirements: string;

  @ApiProperty({ enum: ContractType, example: ContractType.CDI })
  @IsEnum(ContractType, { message: 'Type de contrat invalide (CDI, CDD, SIVP, KARAMA, STAGE, FREELANCE)' })
  contractType: ContractType;

  @ApiProperty({ enum: WorkMode, default: WorkMode.HYBRID })
  @IsEnum(WorkMode)
  workMode: WorkMode;

  @ApiProperty({ example: 'Confirmé (2-4 ans)', default: 'Confirmé' })
  @IsString()
  @IsNotEmpty()
  experienceLevel: string;

  @ApiProperty({ example: 2500, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @ApiProperty({ example: 3500, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @ApiProperty({ example: 'TND', default: 'TND' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: '11', description: 'Code officiel du gouvernorat tunisien (11 à 83)' })
  @IsString()
  @IsNotEmpty({ message: 'Le code du gouvernorat est obligatoire' })
  governorateCode: string;

  @ApiProperty({ example: 'Les Berges du Lac 2', required: false })
  @IsOptional()
  @IsString()
  delegation?: string;

  @ApiProperty({ example: 36.8372 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 10.2396 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: ['TypeScript', 'NestJS', 'React', 'Docker'], required: false })
  @IsOptional()
  @IsArray()
  skills?: string[];

  @ApiProperty({ enum: OfferStatus, default: OfferStatus.PUBLISHED, required: false })
  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;
}

export class UpdateJobStatusDto {
  @ApiProperty({ enum: OfferStatus })
  @IsEnum(OfferStatus)
  status: OfferStatus;
}
