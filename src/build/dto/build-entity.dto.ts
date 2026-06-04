import { EntityDto } from 'src/common/dto/entity.dto';
import { BuildStatus } from 'src/postgres/entities/build.entity';

export class BuildEntityDto extends EntityDto {
  status: BuildStatus;
  version: number;
  logs: string;
  startedAt: string;
  finishedAt: string;
  repoId: string;
}
