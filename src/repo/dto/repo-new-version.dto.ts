import { IsArray, IsUUID } from 'class-validator';

export class RepoNewVersionDto {
  @IsArray()
  @IsUUID('4', { each: true })
  componentBuildIds: string[];
}
