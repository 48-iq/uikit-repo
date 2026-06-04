import { IsOptional, IsString } from 'class-validator';

export class RepoUpdateDto {
  @IsOptional()
  @IsString()
  description?: string;
}
