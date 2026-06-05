import { BuildEntityDto } from 'src/build/dto/build-entity.dto';
import { EntityDto } from 'src/common/dto/entity.dto';
import { RepoTag } from 'src/postgres/entities/repo-tag.enum';

export class RepoEntityDto extends EntityDto {
  name: string;
  username: string;
  description: string;
  latestBuildId: string | null;
  latestBuildVersion: number | null;
  builds?: BuildEntityDto[];
  tags: RepoTag[];
}
