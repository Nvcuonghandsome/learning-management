import { Controller, Get, Param, Query } from '@nestjs/common';
import { CourseService } from './course.service';

@Controller('courses')
export class CourseController {
  constructor(private courseService: CourseService) {}

  @Get('/')
  listCourses(@Query('category') category?: string) {
    return this.courseService.listCourses(category);
  }

  @Get('/:courseId')
  getCourse(@Param('courseId') courseId: string) {
    return this.courseService.getCourse(courseId);
  }
}
