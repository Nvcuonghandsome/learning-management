import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { UploadVideoUrlDto } from './dto/s3.dto';

@Injectable()
export class S3Service {
  private s3: AWS.S3;

  constructor(private config: ConfigService) {
    this.s3 = new AWS.S3({
      region: config.get('AWS_REGION'),
      accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY'),
      signatureVersion: 'v4',
    });
  }

  async getUploadVideoUrl(body: UploadVideoUrlDto) {
    const { fileName, fileType } = body;
    const uniqueId = uuidv4();
    const key = `videos/${uniqueId}/${fileName}`;

    const params = {
      Bucket: this.config.get('S3_BUCKET_NAME'),
      Key: key,
      Expires: 60, // 60 seconds
      ContentType: fileType,
    };

    const uploadUrl = this.s3.getSignedUrl('putObject', params);
    const videoUrl = `${this.config.get('CLOUDFRONT_DOMAIN')}/videos/${uniqueId}/${fileName}`;
    return {
      message: 'Upload URL generate successfully!',
      data: {
        uploadUrl,
        videoUrl,
      },
    };
  }
}
