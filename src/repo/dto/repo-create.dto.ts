import { IsArray, IsString, IsUUID } from 'class-validator';

export class RepoCreateDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  @IsUUID('4', { each: true })
  componentBuildIds: string[];
}
