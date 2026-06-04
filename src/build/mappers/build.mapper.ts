import { Build } from 'src/postgres/entities/build.entity';
import { BuildCursorResultDto } from '../dto/build-cursor-result.dto';
import { BuildEntityDto } from '../dto/build-entity.dto';
import { BuildEntityResultDto } from '../dto/build-entity-result.dto';

export class BuildMapper {
  static toEntityDto(build: Build): BuildEntityDto {
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
    return dto;
  }

  static toEntityResultDto(build: Build): BuildEntityResultDto {
    return { success: true, result: this.toEntityDto(build) };
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
