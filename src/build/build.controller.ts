import { Controller, Get, Param, Query, StreamableFile } from '@nestjs/common';
import { Public } from 'src/security/public.decorator';
import { BuildFiltersDto } from './dto/build-filters.dto';
import { BuildService } from './services/build.service';

@Controller('/api/repo/builds')
export class BuildController {
  constructor(private readonly buildService: BuildService) {}

  @Public()
  @Get('/:buildId')
  async getById(@Param('buildId') buildId: string) {
    return this.buildService.getById(buildId);
  }

  @Public()
  @Get()
  async getByFilters(@Query() dto: BuildFiltersDto) {
    return this.buildService.getByFilters(dto);
  }

  @Public()
  @Get('/:buildId/package')
  async getPackage(@Param('buildId') buildId: string) {
    const file = await this.buildService.getPackage(buildId);
    return new StreamableFile(file);
  }
}
