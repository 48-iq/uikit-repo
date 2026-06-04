import { ResultDto } from 'src/common/dto/result.dto';
import { BuildEntityDto } from 'src/build/dto/build-entity.dto';
import { RepoEntityDto } from './repo-entity.dto';

export class RepoCreateResultDto extends ResultDto<{
  repo: RepoEntityDto;
  build: BuildEntityDto;
}> {}
