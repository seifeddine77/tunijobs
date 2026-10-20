import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'candidat@tunijobs.tn' })
  @IsEmail({}, { message: 'Format d\'email invalide' })
  email: string;

  @ApiProperty({ example: 'Tunisia2026!' })
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit comporter au moins 8 caractères' })
  password: string;

  @ApiProperty({ enum: UserRole, default: UserRole.CANDIDATE })
  @IsEnum(UserRole, { message: 'Rôle invalide (CANDIDATE, RECRUITER, ADMIN)' })
  role: UserRole;

  @ApiProperty({ example: '+216 98 123 456', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Yassine', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Trabelsi', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: 'Vermeg Tunisie', required: false })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ example: '1234567A/A/M/000', required: false })
  @IsOptional()
  @IsString()
  taxId?: string;
}
