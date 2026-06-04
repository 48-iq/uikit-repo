import { Build } from 'src/postgres/entities/build.entity';
import { BuildCursorResultDto } from '../dto/build-cursor-result.dto';
import { BuildEntityDto } from '../dto/build-entity.dto';
import { BuildEntityResultDto } from '../dto/build-entity-result.dto';
import { ComponentBuild } from 'src/postgres/entities/component-build.entity';

export class BuildMapper {
  static toEntityDto(build: Build, componentBuilds?: ComponentBuild[]): BuildEntityDto {
    const dto = new BuildEntityDto();
    dto.id = build.id;
    dto.createdAt = build.startedAt?.toISOString() ?? '';
    dto.updatedAt = build.updatedAt?.toISOString() ?? '';
    dto.status = build.status;
    dto.version = build.version;
    dto.logs = build.logs ?? '';
    dto.startedAt = build.startedAt?.toISOString() ?? '';
    dto.finishedAt = build.finishedAt?.toISOString() ?? '';
    dto.repoId = build.repo?.id ?? '';
    dto.componentBuilds = componentBuilds?.map((cb) => ({
      componentId: cb.componentId,
      name: cb.componentName,
      username: cb.componentUsername,
      version: cb.buildVersion,
    }))
    return dto;
  }

  static toEntityResultDto(build: Build, componentBuilds?: ComponentBuild[]): BuildEntityResultDto {
    return { success: true, result: this.toEntityDto(build, componentBuilds) };
  }

  static toCursorResultDto(args: {
    builds: Build[];
    itemsLeft: number;
    startDate: Date;
    itemsSkipped: number;
  }): BuildCursorResultDto {
    const dto = new BuildCursorResultDto();
    dto.success = true;
    dto.result = {
      data: args.builds.map((b) => this.toEntityDto(b)),
      itemsLeft: args.itemsLeft,
      startDate: args.startDate.toISOString(),
      itemsSkipped: args.itemsSkipped,
    };
    return dto;
  }
}
