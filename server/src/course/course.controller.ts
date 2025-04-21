import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CourseService } from './course.service';
import {
  CreateChapterDto,
  CreateCourseDto,
  CreateSectionDto,
  UpdateChapterDto,
  UpdateCourseDto,
  UpdateSectionDto,
} from './dto/course.dto';

@Controller('courses')
export class CourseController {
  constructor(private courseService: CourseService) {}

  @Get('/')
  listCourses(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.courseService.listCourses(category, search, page, limit);
  }

  @Get('/:courseId')
  getCourse(@Param('courseId') courseId: string) {
    return this.courseService.getCourse(courseId);
  }

  @Post('/create')
  createCourse(@Body() body: CreateCourseDto) {
    return this.courseService.createCourse(body);
  }

  @Put('/update/:courseId')
  updateCourse(
    @Param('courseId') courseId: string,
    @Body() body: UpdateCourseDto,
  ) {
    return this.courseService.updateCourse(courseId, body);
  }

  @Delete('/delete/:courseId')
  deleteCourse(@Param('courseId') courseId: string) {
    return this.courseService.deleteCourse(courseId);
  }

  @Post('/section/create')
  createSection(@Body() body: CreateSectionDto) {
    return this.courseService.createSection(body);
  }

  @Put('/section/update/:sectionId')
  updateSection(
    @Param('sectionId') sectionId: string,
    @Body() body: UpdateSectionDto,
  ) {
    return this.courseService.updateSection(sectionId, body);
  }

  @Delete('/section/delete/:sectionId')
  deleteSection(@Param('sectionId') sectionId: string) {
    return this.courseService.deleteSection(sectionId);
  }

  @Post('/chapter/create')
  createChapter(@Body() body: CreateChapterDto) {
    return this.courseService.createChapter(body);
  }

  @Put('/chapter/update/:chapterId')
  updateChapter(
    @Param('chapterId') chapterId: string,
    @Body() body: UpdateChapterDto,
  ) {
    return this.courseService.updateChapter(chapterId, body);
  }

  @Delete('/chapter/delete/:chapterId')
  deleteChapter(@Param('chapterId') chapterId: string) {
    return this.courseService.deleteChapter(chapterId);
  }

  // PROGRESS
  @Get('/progress/user-enrolled-courses/:userId')
  getUserEnrolledCourses(@Param('userId') userId: string) {
    return this.courseService.getUserEnrolledCourses(userId);
  }

  @Get('/progress/user-course-progress')
  getUserCourseProgress(
    @Query('userId') userId: string,
    @Query('courseId') courseId: string,
  ) {
    console.log('userId000', userId, 'courseId', courseId);
    return this.courseService.getUserCourseProgress(userId, courseId);
  }
}
