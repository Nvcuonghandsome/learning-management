import { Body, Controller, Put } from '@nestjs/common';
import { S3Service } from './s3.service';
import { UploadVideoUrlDto } from './dto/s3.dto';

@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Put('upload-video-url')
  getUploadVideoUrl(@Body() body: UploadVideoUrlDto) {
    return this.s3Service.getUploadVideoUrl(body);
  }
}
