import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsString, IsUUID } from 'class-validator';
import { RepoTag } from 'src/postgres/entities/repo-tag.enum';

export class RepoCreateDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  @IsUUID('4', { each: true })
  componentBuildIds: string[];

  @Transform(({ value }) => {
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
      } catch {
        return [value];
      }
    }
    return value;
  })
  @IsEnum(RepoTag, { each: true })
  @IsArray()
  tags: RepoTag[];
}
