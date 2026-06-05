import { Controller, Get, Param } from '@nestjs/common';
import { Public } from 'src/security/public.decorator';
import { RepoStatService } from './repo-stat.service';

@Controller('/api/repo/stat/repo')
export class RepoStatController {
  constructor(private readonly repoStatService: RepoStatService) {}

  @Public()
  @Get('/:repoId')
  async getRepoStat(@Param('repoId') repoId: string) {
    return this.repoStatService.getRepoStat(repoId);
  }
}
