import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  teacherId: string;

  @IsString()
  teacherName: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsEnum(['Beginner', 'Intermediate', 'Advanced'])
  level: 'Beginner' | 'Intermediate' | 'Advanced';

  @IsEnum(['Draft', 'Published'])
  status: 'Draft' | 'Published';
}

export class UpdateCourseDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  // @IsEnum(['Beginner', 'Intermediate', 'Advanced'])
  // level: 'Beginner' | 'Intermediate' | 'Advanced';

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

  @IsNumber()
  order: number;
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

  @IsOptional()
  @IsString()
  videoLength?: number;

  @IsOptional()
  @IsString()
  videoType?: string;

  @IsOptional()
  @IsString()
  videoUniqueId?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
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

  @IsNumber()
  order: number;

  @IsOptional()
  @IsString()
  videoLength?: number;

  @IsOptional()
  @IsString()
  videoType?: string;

  @IsOptional()
  @IsString()
  videoUniqueId?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  video?: string;
}
