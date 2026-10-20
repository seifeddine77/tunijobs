import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ContractType, WorkMode } from '@prisma/client';

export class JobQueryDto {
  @ApiProperty({ required: false, description: 'Recherche par mot-clé (titre, description)' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({ required: false, description: 'Code du gouvernorat (ex: 11 pour Tunis)' })
  @IsOptional()
  @IsString()
  governorate?: string;

  @ApiProperty({ enum: ContractType, required: false })
  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @ApiProperty({ enum: WorkMode, required: false })
  @IsOptional()
  @IsEnum(WorkMode)
  workMode?: WorkMode;

  @ApiProperty({ required: false, description: 'Salaire mensuel minimum en TND' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minSalary?: number;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
