import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, IsUrl } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Vermeg Tunisie' })
  @IsString()
  @IsNotEmpty({ message: 'Le nom de l\'entreprise est obligatoire' })
  name: string;

  @ApiProperty({
    example: '1234567A/A/M/000',
    description: 'Matricule Fiscal tunisien : 7 chiffres + lettre + /A ou /B ou /P + /M ou /C + /000',
  })
  @IsString()
  @Matches(/^\d{7}[A-Z]\/[A-Z]\/[A-Z]\/\d{3}$/, {
    message: 'Format du matricule fiscal tunisien invalide (ex: 1234567A/A/M/000)',
  })
  taxId: string;

  @ApiProperty({ example: 'Technologies de l\'information' })
  @IsString()
  @IsNotEmpty()
  sector: string;

  @ApiProperty({ example: '100-250 employés' })
  @IsString()
  @IsNotEmpty()
  size: string;

  @ApiProperty({ example: 'https://monentreprise.tn', required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ example: 'Leader dans l\'édition de logiciels financiers...', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://minio.tunijobs.tn/logos/vermeg.png', required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string;
}

export class UpdateCompanyDto {
  @ApiProperty({ example: 'Vermeg Tunisie', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Banque & Assurance', required: false })
  @IsOptional()
  @IsString()
  sector?: string;

  @ApiProperty({ example: '500+ employés', required: false })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiProperty({ example: 'https://www.vermeg.com', required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string;
}
