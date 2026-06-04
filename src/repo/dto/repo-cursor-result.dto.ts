import { CursorDto } from 'src/common/dto/cursor.dto';
import { ResultDto } from 'src/common/dto/result.dto';
import { RepoEntityDto } from './repo-entity.dto';

export class RepoCursorResultDto extends ResultDto<CursorDto<RepoEntityDto>> {}
