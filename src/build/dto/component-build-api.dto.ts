export class BuildListEntityDto {
  id: string;
  componentId: string;
  name: string;
  username: string;
  packageFilename: string;
  version: number;
}

export class BuildListResultDto {
  success: boolean;
  result?: BuildListEntityDto[];
}
