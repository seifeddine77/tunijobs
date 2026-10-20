import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GeoService } from './geo.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Cartographie & Gouvernorats')
@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Public()
  @Get('governorates')
  @ApiOperation({ summary: 'Lister les 24 gouvernorats tunisiens avec nombre d\'offres actives' })
  async listAll() {
    return this.geoService.listGovernoratesWithCounts();
  }

  @Public()
  @Get('governorates/:code')
  @ApiOperation({ summary: 'Obtenir les délégations et coordonnées d\'un gouvernorat' })
  async getByCode(@Param('code') code: string) {
    return this.geoService.getGovernorateByCode(code);
  }
}
