import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Pencil, Trash2 } from 'lucide-react';

const TeacherCourseCard = ({
  course,
  onEdit,
  onDelete,
  isOwner,
}: TeacherCourseCardProps) => {
  return (
    <Card className="course-card-teacher group">
      <CardHeader className="course-card-teacher__header">
        {course.image && (
          <Image
            src={course.image || '/placeholder.png'}
            alt={course.title}
            width={400}
            height={350}
            className="course-card-teacher__image"
            priority
          />
        )}
      </CardHeader>
      <CardContent className="course-card-teacher__content">
        <div className="flex flex-col">
          <CardTitle className="course-card-teacher__title">
            {course.title}
          </CardTitle>

          <CardDescription className="course-card-teacher__category">
            {course.category}
          </CardDescription>

          <p className="text-sm mt-2">
            Status:{' '}
            <span
              className={cn(
                'font-semibold px-2 py-1 rounded',
                course.status === 'Published'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400',
              )}
            >
              {course.status}
            </span>
          </p>
          {course.enrollments && (
            <p className="ml-1 mt-1 inline-block text-secondary bg-secondary/10 text-sm font-bold">
              <span className="font-bold text-white-100">
                {course.enrollments.length}
              </span>{' '}
              Student{course.enrollments.length > 1 ? 's' : ''} Enrolled
            </p>
          )}
        </div>

        <div className="w-full flex gap-2 mt-3">
          {isOwner ? (
            <>
              <div>
                <Button
                  variant="outline"
                  className="course-card-teacher__edit-button"
                  onClick={() => onEdit(course.courseId)}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Course
                </Button>
              </div>
              <div>
                <Button
                  variant="outline"
                  className="course-card-teacher__delete-button"
                  onClick={() => onDelete(course.courseId)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Course
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">View Only</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherCourseCard;
