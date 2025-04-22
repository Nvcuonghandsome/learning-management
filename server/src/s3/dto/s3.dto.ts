import { IsString } from 'class-validator';

export class UploadVideoUrlDto {
  @IsString()
  fileName: string;

  @IsString()
  fileType: string;
}
