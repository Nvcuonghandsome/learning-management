import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  async listCourses(category?: string) {
    try {
      let conditions = {};
      if (category && category !== 'all') {
        conditions = {
          where: { category },
        };
      }

      const courses = await this.prisma.course.findMany({
        ...conditions,
        include: {
          sections: {
            include: {
              chapters: true
            }
          },
          enrollments: true
        }
      });

      return {
        message: 'Courses retrieved successfully.',
        data: courses,
      };
    } catch (error) {
      return {
        message: 'Courses retrieved failed.',
        error: error,
      };
    }
  }

  async getCourse(courseId: string) {
    try {
      if (!courseId) {
        throw new BadRequestException('Course Id is required!');
      }

      const course = await this.prisma.course.findUnique({
        where: { courseId },
        include: {
          sections: {
            include: {
              chapters: {
                include: {
                  comments: true
                }
              }
            }
          },
          enrollments: true,
          UserCourseProgress: true
        }
      });
      
      if (!course) {
        throw new NotFoundException(`Course ${courseId} not found!`);
      }

      return {
        message: 'Course retrieved successfully.',
        data: course,
      };
    } catch (error) {
      console.log('error', error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      // handle known Prisma errors
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException(`Database error: ${error.message}`);
      }

      if (error instanceof PrismaClientValidationError) {
        throw new BadRequestException(`Validation error: ${error.message}`);
      }

      throw new InternalServerErrorException('Failed to retrieve course!');
    }
  }
}
