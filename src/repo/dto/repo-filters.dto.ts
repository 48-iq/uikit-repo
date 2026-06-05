import { Transform, Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { RepoTag } from 'src/postgres/entities/repo-tag.enum';

export class RepoFiltersDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort?: 'asc' | 'desc';

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") return value.split(",").filter(Boolean);
    return value;
  })
  @IsArray()
  @IsEnum(RepoTag, { each: true })
  tags?: RepoTag[];
}
