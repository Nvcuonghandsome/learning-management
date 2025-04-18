'use client';

import Header from '@/components/Header';
import Loading from '@/components/Loading';
import TeacherCourseCard from '@/components/TeacherCourseCard';
import Toolbar from '@/components/Toolbar';
import { Button } from '@/components/ui/button';
import {
  useCreateCourseMutation,
  useDeleteCourseMutation,
  useGetCoursesQuery,
} from '@/state/api';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const Courses = () => {
  const router = useRouter();
  const { user } = useUser();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [createCourse] = useCreateCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();

  // Fetch courses based on filters
  const {
    data: courses,
    isLoading,
    isError,
  } = useGetCoursesQuery({
    category: selectedCategory,
    search: searchTerm,
  });

  const handleEdit = (courseId: string) => {
    router.push(`/teacher/courses/${courseId}`);
  };

  const handleDelete = async (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      await deleteCourse({ courseId }).unwrap();
    }
  };

  const handleCreateCourse = async () => {
    if (!user) return;

    const result = await createCourse({
      teacherId: user.id,
      teacherName: user.fullName || 'Unknown Teacher',
    }).unwrap();

    router.push(`/teacher/courses/${result.courseId}`);
  };

  if (isLoading) return <Loading />;
  if (isError) return <div>Failed to get courses</div>;

  return (
    <div className="teacher-courses">
      <Header
        title="Courses"
        subtitle="Browse your courses"
        rightElement={
          <Button
            onClick={handleCreateCourse}
            className="teacher-courses__header"
          >
            Create Course
          </Button>
        }
      />
      <Toolbar
        onSearch={setSearchTerm}
        onCategoryChange={setSelectedCategory}
      />
      <div className="teacher-courses__grid">
        {courses?.map((course) => (
          <TeacherCourseCard
            key={course.courseId}
            course={course}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isOwner={course.teacherId === user?.id}
          />
        ))}
      </div>
    </div>
  );
};

export default Courses;
