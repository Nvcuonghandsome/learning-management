import { IsAlpha, IsArray, IsEnum, IsNumber, IsString } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  teacherId: string;

  @IsString()
  teacherName: string;

  @IsString()
  title: string;

  @IsString()
  description?: string;

  @IsString()
  category: string;

  @IsString()
  image?: string;

  @IsNumber()
  price?: number;

  @IsEnum(['Beginner', 'Intermediate', 'Advanced'])
  level: 'Beginner' | 'Intermediate' | 'Advanced';

  @IsEnum(['Draft', 'Published'])
  status: 'Draft' | 'Published';
}

export class CreateSectionDto {
  @IsString()
  courseId: string;

  @IsString()
  sectionTitle: string;

  @IsString()
  sectionDescription?: string;
}

export class UpdateSectionDto {
  @IsString()
  sectionTitle: string;

  @IsString()
  sectionDescription?: string;
}

export class CreateChapterDto {
  @IsString()
  sectionId: string;

  @IsEnum(['Text', 'Quiz', 'Video'])
  type: 'Text' | 'Quiz' | 'Video';

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  videoLength?: number;

  @IsString()
  videoType?: string;

  @IsString()
  videoUniqueId?: string;

  @IsString()
  videoUrl?: string;

  @IsString()
  video?: string;
}

export class UpdateChapterDto {
  @IsEnum(['Text', 'Quiz', 'Video'])
  type: 'Text' | 'Quiz' | 'Video';

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  videoLength?: number;

  @IsString()
  videoType?: string;

  @IsString()
  videoUniqueId?: string;

  @IsString()
  videoUrl?: string;

  @IsString()
  video?: string;
}
