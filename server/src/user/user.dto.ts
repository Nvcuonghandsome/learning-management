import { IsObject } from 'class-validator';

export class UpdateUserDto {
  @IsObject()
  publicMetadata: {
    userType: 'student' | 'teacher';
    settings: any;
  };
}
