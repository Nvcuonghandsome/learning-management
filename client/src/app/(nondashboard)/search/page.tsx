'use client';

import Loading from '@/components/Loading';
import { useGetCoursesQuery } from '@/state/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CourseCardSearch from '@/components/CourseCardSearch';
import SelectedCourse from './SelectedCourse';

const Search = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const { data: courses, isLoading, isError } = useGetCoursesQuery({});

  useEffect(() => {
    if (courses) {
      if (id) {
        const selectedCourse = courses.find((course) => course.courseId === id);
        setSelectedCourse(selectedCourse || courses[0]);
      }
    }
  }, [courses, id]);

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    router.push(`/search/?id=${course.courseId}`);
  };

  const handleEnrollNow = (course: Course) => {
    router.push(`/checkout/?step=1&id=${course.courseId}&showSignup=false`);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !courses) {
    return <div>Failed to fetch courses!</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="search"
    >
      <h1 className="search__title">List of available courses</h1>
      <h2 className="search__subtitle">{courses.length} courses available</h2>
      <div className="search__content">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="search__courses-grid"
        >
          {courses.map((course) => (
            <CourseCardSearch
              key={course.courseId}
              course={course}
              isSelected={selectedCourse?.courseId === course.courseId}
              onClick={() => handleCourseSelect(course)}
            />
          ))}
        </motion.div>

        {selectedCourse && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="search__selected-course"
          >
            <SelectedCourse
              course={selectedCourse}
              handleEnrollNow={() => handleEnrollNow(selectedCourse)}
              // handleEnrollNow={handleEnrollNow}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Search;
