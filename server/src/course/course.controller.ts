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

  @Put('/update')
  updateCourse(
    @Query('courseId') courseId: string,
    @Body() body: CreateCourseDto,
  ) {
    return this.courseService.updateCourse(courseId, body);
  }

  @Delete('/delete')
  deleteCourse(@Query('courseId') courseId: string) {
    return this.courseService.deleteCourse(courseId);
  }

  @Post('/section/create')
  createSection(@Body() body: CreateSectionDto) {
    return this.courseService.createSection(body);
  }

  @Put('/section/update')
  updateSection(
    @Query('sectionId') sectionId: string,
    @Body() body: UpdateSectionDto,
  ) {
    return this.courseService.updateSection(sectionId, body);
  }

  @Delete('/section/delete')
  deleteSection(@Query('sectionId') sectionId: string) {
    return this.courseService.deleteSection(sectionId);
  }

  @Post('/chapter/create')
  createChapter(@Body() body: CreateChapterDto) {
    return this.courseService.createChapter(body);
  }

  @Put('/chapter/update')
  updateChapter(
    @Query('chapterId') chapterId: string,
    @Body() body: UpdateChapterDto,
  ) {
    return this.courseService.updateChapter(chapterId, body);
  }

  @Delete('/chapter/delete')
  deleteChapter(@Query('chapterId') chapterId: string) {
    return this.courseService.deleteChapter(chapterId);
  }
}
