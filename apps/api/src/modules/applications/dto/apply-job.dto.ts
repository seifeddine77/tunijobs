import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from '@prisma/client';

export class ApplyJobDto {
  @ApiProperty({ example: 'Madame, Monsieur, je postule avec enthousiasme...', required: false })
  @IsOptional()
  @IsString()
  coverLetter?: string;
}

export class UpdateApplicationStatusDto {
  @ApiProperty({ enum: ApplicationStatus, example: ApplicationStatus.INTERVIEW })
  @IsEnum(ApplicationStatus, { message: 'Statut invalide (RECEIVED, SCREENED, INTERVIEW, OFFER, REJECTED)' })
  status: ApplicationStatus;
}

export class AddApplicationNoteDto {
  @ApiProperty({ example: 'Excellent profil technique, entretien technique prévu jeudi à 14h.' })
  @IsString()
  @IsNotEmpty({ message: 'Le contenu de la note est obligatoire' })
  content: string;
}
