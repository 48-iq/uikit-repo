import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { Public } from 'src/security/public.decorator';
import { RepoCreateDto } from './dto/repo-create.dto';
import { RepoFiltersDto } from './dto/repo-filters.dto';
import { RepoNewVersionDto } from './dto/repo-new-version.dto';
import { RepoService } from './repo.service';

@Controller('/api/repo/main')
export class RepoController {
  constructor(private readonly repoService: RepoService) {}

  // @Public()
  // @Get('/:repoId')
  // async getById(@Param('repoId') repoId: string) {
  //   return this.repoService.getById(repoId);
  // }

  @Public()
  @Get('/:username/:name')
  async get(
    @Param('username') username: string,
    @Param('name') name: string,
    @Query('version') version?: string,
  ) {
    return await this.repoService.getByNameAndUsername({
      name,
      username,
      version: version ? +version : undefined,
    });
  }

  @Public()
  @Get()
  async getByFilters(@Query() dto: RepoFiltersDto) {
    return this.repoService.getByFilters(dto);
  }

  @Post()
  async create(@Body() dto: RepoCreateDto, @Req() req: any) {
    return this.repoService.create({ dto, username: req['authPayload']['username'] });
  }

  @Post('/:repoId/version')
  async newVersion(
    @Param('repoId') repoId: string,
    @Body() dto: RepoNewVersionDto,
    @Req() req: any,
  ) {
    return this.repoService.newVersion({
      repoId,
      dto,
      username: req['authPayload']['username'],
    });
  }
}
