import { Body, Controller, Get, Param, Post, Query, Req, StreamableFile } from '@nestjs/common';
import { RepoService } from './repo.service';
import { RepoCreateDto } from '@48-iq/uikit-dto-lib';
import { RepoMapper } from './repo.mapper';

@Controller('/api/repo')
export class RepoController {
  constructor(
    private readonly repoService: RepoService,
    private readonly repoMapper: RepoMapper
  ) {}

  @Get('/:username')
  async getRepoByUser(
    @Param('username') username: string
  ) {
    const repos = await this.repoService.getRepoByUser(username);
    const response = this.repoMapper.entityToDtos(repos);
    return response;
  }

  @Get('/:username/:name')
  getRepo(
    @Param('username') username: string,
    @Param('name') name: string,
  ) {
    const repoId = `${username}/${name}`;
    return this.repoService.getRepo(repoId);
  }

  @Get('/package/:username/:name')
  async getPackage(
    @Param('username') username: string,
    @Param('name') name: string,
    
  ) {
    const packageId = `${username}/${name}`;
    const file = await this.repoService.getPackage(packageId);
    return new StreamableFile(file);
  }

  @Post()
  async createRepo(
    @Body() repo: RepoCreateDto,
    @Req() req
  ) {
    const username = req['authPayload']['username'];
    
    const result = await this.repoService.createNewRepo({
      username,
      repo,
    });

    const response = this.repoMapper.entityToDto(result);
    return response;
  }
}
