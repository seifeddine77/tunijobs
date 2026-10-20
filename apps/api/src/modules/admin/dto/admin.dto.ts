import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CompanyStatus } from '@prisma/client';

export class ReviewCompanyDto {
  @ApiProperty({ enum: CompanyStatus, example: CompanyStatus.APPROVED })
  @IsEnum(CompanyStatus, { message: 'Le statut doit être APPROVED ou REJECTED' })
  status: CompanyStatus;

  @ApiProperty({ example: 'Matricule fiscal vérifié auprès du RNE Tunisie', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export enum AdminUserAction {
  SUSPEND = 'SUSPEND',
  ACTIVATE = 'ACTIVATE',
  DELETE = 'DELETE',
}

export class UserActionDto {
  @ApiProperty({ enum: AdminUserAction, example: AdminUserAction.SUSPEND })
  @IsEnum(AdminUserAction)
  action: AdminUserAction;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
