import { Injectable } from '@nestjs/common';
import { BuildMapper } from 'src/build/mappers/build.mapper';
import { Build } from 'src/postgres/entities/build.entity';
import { Repo } from 'src/postgres/entities/repo.entity';
import { RepoCreateResultDto } from './dto/repo-create-result.dto';
import { RepoCursorResultDto } from './dto/repo-cursor-result.dto';
import { RepoEntityDto } from './dto/repo-entity.dto';
import { RepoEntityResultDto } from './dto/repo-entity-result.dto';

@Injectable()
export class RepoMapper {
  static toEntityDto(entity: Repo, latestBuild?: Build | null): RepoEntityDto {
    const dto = new RepoEntityDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.username = entity.username;
    dto.description = entity.description;
    dto.createdAt = entity.createdAt?.toISOString() ?? '';
    dto.updatedAt = entity.updatedAt?.toISOString() ?? '';
    dto.latestBuildId = latestBuild?.id ?? null;
    dto.latestBuildVersion = latestBuild?.version ?? null;
    return dto;
  }

  static toEntityResultDto(entity: Repo, latestBuild?: Build | null): RepoEntityResultDto {
    return { success: true, result: this.toEntityDto(entity, latestBuild) };
  }

  static toCreateResultDto(repo: Repo, build: Build): RepoCreateResultDto {
    const dto = new RepoCreateResultDto();
    dto.success = true;
    dto.result = {
      repo: this.toEntityDto(repo),
      build: BuildMapper.toEntityDto(build),
    };
    return dto;
  }

  static toCursorResultDto(args: {
    repos: Repo[];
    itemsLeft: number;
    startDate: Date;
    itemsSkipped: number;
  }): RepoCursorResultDto {
    const dto = new RepoCursorResultDto();
    dto.success = true;
    dto.result = {
      data: args.repos.map((r) => this.toEntityDto(r)),
      itemsLeft: args.itemsLeft,
      startDate: args.startDate.toISOString(),
      itemsSkipped: args.itemsSkipped,
    };
    return dto;
  }
}
