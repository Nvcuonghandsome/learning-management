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
import {
  CreateChapterDto,
  CreateCourseDto,
  CreateSectionDto,
  UpdateChapterDto,
  UpdateCourseDto,
  UpdateSectionDto,
} from './dto/course.dto';
import { ClerkService } from 'src/clerk/clerk.service';

@Injectable()
export class CourseService {
  constructor(
    private prisma: PrismaService,
    private clerk: ClerkService,
  ) {}

  async listCourses(
    category?: string,
    search?: string,
    page = '1',
    limit = '10',
  ) {
    try {
      const pageNumber = parseInt(page, 10) || 1;
      const limitNumber = parseInt(limit, 10) || 10;
      const skip = (pageNumber - 1) * limitNumber;

      let whereCondition: any = {
        isDeleted: false,
      };

      if (category && category !== 'all') {
        whereCondition.category = category;
      }

      if (search) {
        whereCondition.title = {
          contains: search,
          mode: 'insensitive',
        };
      }

      const [courses, totalCount] = await this.prisma.$transaction([
        this.prisma.course.findMany({
          where: whereCondition,
          include: {
            sections: {
              include: {
                chapters: {
                  orderBy: {
                    order: 'asc',
                  },
                },
              },
              orderBy: {
                order: 'asc',
              },
            },
            enrollments: true,
          },
          skip,
          take: limitNumber,
        }),
        this.prisma.course.count({
          where: whereCondition,
        }),
      ]);

      return {
        message: 'Courses retrieved successfully.',
        data: courses,
        pagination: {
          total: totalCount,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalCount / limitNumber),
        },
      };
    } catch (error) {
      return {
        message: 'Courses retrieval failed.',
        error: error.message || error,
      };
    }
  }

  async getCourse(courseId: string) {
    try {
      if (!courseId) {
        throw new BadRequestException('Course Id is required!');
      }

      const course = await this.prisma.course.findUnique({
        where: { courseId, isDeleted: false },
        include: {
          sections: {
            include: {
              chapters: {
                include: {
                  comments: true,
                },
                orderBy: {
                  order: 'asc',
                },
              },
            },
            orderBy: {
              order: 'asc',
            },
          },
          enrollments: true,
          UserCourseProgress: true,
        },
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

  async createCourse(body: CreateCourseDto) {
    const newCourse = await this.prisma.course.create({
      data: {
        teacherId: body.teacherId,
        teacherName: body.teacherName,
        title: body.title,
        category: body.category,
        status: body.status,
        level: body.level,
        description: body.description || '',
        price: body.price || 0,
        image: body.image || '',
      },
    });
    return {
      message: 'Create course successfully!',
      data: newCourse,
    };
  }

  async updateCourse(courseId: string, body: UpdateCourseDto) {
    // check course existed
    const course = await this.prisma.course.findUnique({
      where: {
        courseId,
        isDeleted: false,
      },
    });

    if (!course) {
      return {
        message: 'Course not found!',
      };
    }

    const updatedCourse = await this.prisma.course.update({
      where: {
        courseId: courseId,
        isDeleted: false,
      },
      data: {
        title: body.title,
        category: body.category,
        status: body.status,
        ...(body.description !== undefined && {
          description: body.description,
        }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.image !== undefined && { image: body.image }),
      },
    });

    return {
      message: 'Update course successfully!',
      data: updatedCourse,
    };
  }

  async deleteCourse(courseId: string) {
    // check course existed
    const course = await this.prisma.course.findUnique({
      where: {
        courseId,
      },
    });

    if (!course) {
      return {
        message: 'Course not found!',
      };
    }

    await this.prisma.course.update({
      where: {
        courseId: courseId,
      },
      data: {
        isDeleted: true,
      },
    });

    return {
      message: 'Delete course successfully!',
    };
  }

  async createSection(body: CreateSectionDto) {
    // check course existed
    const course = await this.prisma.course.findUnique({
      where: {
        courseId: body.courseId,
      },
    });

    if (!course) {
      return {
        message: 'Course which section linked with not found!',
      };
    }

    const newSection = await this.prisma.section.create({
      data: {
        courseId: body.courseId,
        sectionTitle: body.sectionTitle,
        sectionDescription: body.sectionDescription,
      },
    });

    return {
      message: 'Create section successfully!',
      data: newSection,
    };
  }

  async updateSection(sectionId: string, body: UpdateSectionDto) {
    // check section existed
    const section = await this.prisma.section.findUnique({
      where: {
        sectionId,
      },
    });

    if (!section) {
      return {
        message: 'Section not found!',
      };
    }

    const updatedSection = await this.prisma.section.update({
      where: {
        sectionId,
      },
      data: {
        sectionTitle: body.sectionTitle,
        order: body.order,
        ...(body.sectionDescription !== undefined && {
          sectionDescription: body.sectionDescription,
        }),
      },
    });

    return {
      message: 'Update section successfully!',
      data: updatedSection,
    };
  }

  async deleteSection(sectionId: string) {
    await this.prisma.section.delete({
      where: {
        sectionId,
      },
    });

    return {
      message: 'Delete section successfully!',
    };
  }

  async createChapter(body: CreateChapterDto) {
    // check section existed
    const section = await this.prisma.section.findUnique({
      where: {
        sectionId: body.sectionId,
      },
    });

    if (!section) {
      return {
        message: 'Section linked with chapter not found!',
      };
    }

    const newChapter = await this.prisma.chapter.create({
      data: {
        sectionId: body.sectionId,
        type: body.type,
        content: body.content,
        title: body.title,
        ...(body.video !== undefined && {
          video: body.video,
        }),
        ...(body.videoLength !== undefined && {
          videoLength: body.videoLength,
        }),
        ...(body.videoType !== undefined && {
          videoType: body.videoType,
        }),
        ...(body.videoUniqueId !== undefined && {
          videoUniqueId: body.videoUniqueId,
        }),
        ...(body.videoUrl !== undefined && {
          videoUrl: body.videoUrl,
        }),
      },
    });

    return {
      message: 'Create chapter successfully!',
      data: newChapter,
    };
  }

  async updateChapter(chapterId: string, body: UpdateChapterDto) {
    // check chapter existed
    const chapter = await this.prisma.chapter.findUnique({
      where: {
        chapterId,
      },
    });

    if (!chapter) {
      return {
        message: 'Chapter not found!',
      };
    }

    const updatedChapter = await this.prisma.chapter.update({
      where: {
        chapterId,
      },
      data: {
        type: body.type,
        content: body.content,
        title: body.title,
        order: body.order,
        ...(body.video !== undefined && {
          video: body.video,
        }),
        ...(body.videoLength !== undefined && {
          videoLength: body.videoLength,
        }),
        ...(body.videoType !== undefined && {
          videoType: body.videoType,
        }),
        ...(body.videoUniqueId !== undefined && {
          videoUniqueId: body.videoUniqueId,
        }),
        ...(body.videoUrl !== undefined && {
          videoUrl: body.videoUrl,
        }),
      },
    });

    return {
      message: 'Update chapter successfully!',
      data: updatedChapter,
    };
  }

  async deleteChapter(chapterId: string) {
    await this.prisma.chapter.delete({
      where: {
        chapterId,
      },
    });

    return {
      message: 'Delete chapter successfully!',
    };
  }

  // PROGRESS
  async getUserEnrolledCourses(userId: string) {
    const enrolledCourses = await this.prisma.userCourseProgress.findMany({
      where: {
        userId,
      },
      include: {
        course: {
          include: {
            sections: {
              include: {
                chapters: true,
              },
            },
          },
        },
        sections: {
          include: {
            chapters: true,
          },
        },
      },
    });

    return {
      message: 'Retrieved user enrolled courses successfully!',
      data: enrolledCourses,
    };
  }

  async getUserCourseProgress(userId: string, courseId: string) {
    const courseProgress = await this.prisma.userCourseProgress.findFirst({
      where: {
        userId,
        courseId,
      },
      include: {
        course: {
          include: {
            sections: {
              include: {
                chapters: true,
              },
            },
          },
        },
        sections: {
          include: {
            chapters: true,
          },
        },
      },
    });

    return {
      message: 'Retrieved user course progress successfully!',
      data: courseProgress,
    };
  }
}
