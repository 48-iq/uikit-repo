import { EntityDto } from 'src/common/dto/entity.dto';
import { BuildStatus } from 'src/postgres/entities/build.entity';
import { ComponentBuildEntityDto } from './component-build-entity.dto';

export class BuildEntityDto extends EntityDto {
  status: BuildStatus;
  version: number;
  logs: string;
  startedAt: string;
  finishedAt: string;
  name: string;
  repoId: string;
  componentBuilds?: ComponentBuildEntityDto[];
}
