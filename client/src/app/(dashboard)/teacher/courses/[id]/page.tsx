'use client';

import { CustomFormField } from '@/components/CustomFormField';
import DroppableComponent from '@/components/Droppable';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { courseSchema } from '@/lib/schemas';
import { centsToDollars, uploadVideo } from '@/lib/utils';
import { openSectionModal, setSections } from '@/state';
import {
  useGetCourseQuery,
  useUpdateCourseMutation,
  useUpdateSectionMutation,
  useCreateSectionMutation,
  useUpdateChapterMutation,
  useCreateChapterMutation,
  useDeleteSectionMutation,
  useDeleteChapterMutation,
  useGetUploadVideoUrlMutation,
} from '@/state/api';
import { useAppDispatch, useAppSelector } from '@/state/redux';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Plus } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import ChapterModal from './ChapterModal';
import SectionModal from './SectionModal';
import { toast } from 'sonner';

const CourseEditor = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: course, isLoading, refetch } = useGetCourseQuery(id);
  const [updateCourse] = useUpdateCourseMutation();
  const [updateSection] = useUpdateSectionMutation();
  const [createSection] = useCreateSectionMutation();
  const [updateChapter] = useUpdateChapterMutation();
  const [createChapter] = useCreateChapterMutation();
  const [deleteSection] = useDeleteSectionMutation();
  const [deleteChapter] = useDeleteChapterMutation();
  const [getUploadVideo] = useGetUploadVideoUrlMutation();

  const dispatch = useAppDispatch();
  const { sections } = useAppSelector((state) => state.global.courseEditor);

  const methods = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      courseTitle: '',
      courseDescription: '',
      courseCategory: '',
      coursePrice: '0',
      courseStatus: false,
    },
  });

  useEffect(() => {
    if (course) {
      methods.reset({
        courseTitle: course.title,
        courseDescription: course.description,
        coursePrice: centsToDollars(course.price),
        courseCategory: course.category,
        courseStatus: course.status === 'Published',
      });
      dispatch(setSections(course.sections || []));
    }
  }, [course, dispatch, methods]);

  const onSubmit = async (data: CourseFormData) => {
    try {
      // Update course basic information first
      await updateCourse({
        courseId: id,
        title: data.courseTitle,
        description: data.courseDescription,
        category: data.courseCategory,
        price: parseFloat(data.coursePrice),
        status: data.courseStatus ? 'Published' : 'Draft',
      }).unwrap();

      // Get existing sections and chapters from the course data
      const existingSections = course?.sections || [];
      const existingChapters = existingSections.flatMap(
        (section) => section.chapters || [],
      );

      // Find sections and chapters to delete
      const sectionsToDelete = existingSections.filter(
        (existingSection) =>
          !sections.some(
            (section) => section.sectionId === existingSection.sectionId,
          ),
      );

      const chaptersToDelete = existingChapters.filter(
        (existingChapter) =>
          !sections.some((section) =>
            section.chapters.some(
              (chapter) => chapter.chapterId === existingChapter.chapterId,
            ),
          ),
      );

      // Delete removed chapters first
      for (const chapter of chaptersToDelete) {
        if (chapter.chapterId) {
          await deleteChapter({ chapterId: chapter.chapterId }).unwrap();
        }
      }

      // Delete removed sections
      for (const section of sectionsToDelete) {
        if (section.sectionId) {
          await deleteSection({ sectionId: section.sectionId }).unwrap();
        }
      }

      // Handle sections and chapters with order information
      for (
        let sectionIndex = 0;
        sectionIndex < sections.length;
        sectionIndex++
      ) {
        const section = sections[sectionIndex];
        if (section.sectionId && !section.sectionId.includes('dragId')) {
          // Update existing section with order information
          await updateSection({
            sectionId: section.sectionId,
            sectionTitle: section.sectionTitle,
            sectionDescription: section.sectionDescription,
            courseId: id,
            order: sectionIndex,
          }).unwrap();

          // Handle chapters in this section with order information
          for (
            let chapterIndex = 0;
            chapterIndex < section.chapters.length;
            chapterIndex++
          ) {
            const chapter = section.chapters[chapterIndex];
            let videoUrl = '';
            if (chapter.chapterId && !chapter.chapterId.includes('dragId')) {
              if (
                chapter.video instanceof File &&
                chapter.video.type === 'video/mp4'
              ) {
                try {
                  const { video } = await uploadVideo(chapter, getUploadVideo);
                  videoUrl = video;
                } catch (error) {
                  console.error(
                    `Failed to upload video for chapter ${chapter.chapterId}:`,
                    error,
                  );
                }
              }
              // Update existing chapter with order information
              let updatedChapter: Chapter = {
                chapterId: chapter.chapterId,
                title: chapter.title,
                content: chapter.content,
                type: chapter.type,
                sectionId: section.sectionId,
                order: chapterIndex,
              };
              if (videoUrl) {
                updatedChapter = { ...updatedChapter, video: videoUrl };
              }
              await updateChapter(updatedChapter).unwrap();
            } else {
              // Create new chapter with order information
              let videoUrl = '';
              if (
                chapter.video instanceof File &&
                chapter.video.type === 'video/mp4'
              ) {
                try {
                  const { video } = await uploadVideo(chapter, getUploadVideo);
                  videoUrl = video;
                  // updatedSections[i].chapters[j] = updatedChapter;
                } catch (error) {
                  console.error(
                    `Failed to upload video for chapter ${chapter.chapterId}:`,
                    error,
                  );
                }
              }
              let updatedChapter: Chapter = {
                chapterId: chapter.chapterId,
                title: chapter.title,
                content: chapter.content,
                type: chapter.type,
                sectionId: section.sectionId,
                order: chapterIndex,
              };
              if (videoUrl) {
                updatedChapter = { ...updatedChapter, video: videoUrl };
              }
              await updateChapter(updatedChapter).unwrap();
            }
          }
        } else {
          // Create new section with order information
          const newSection = await createSection({
            sectionTitle: section.sectionTitle,
            sectionDescription: section.sectionDescription,
            courseId: id,
            order: sectionIndex,
          }).unwrap();

          // Create chapters for the new section with order information
          for (
            let chapterIndex = 0;
            chapterIndex < section.chapters.length;
            chapterIndex++
          ) {
            const chapter = section.chapters[chapterIndex];
            let videoUrl = '';
            if (
              chapter.video instanceof File &&
              chapter.video.type === 'video/mp4'
            ) {
              try {
                const { video } = await uploadVideo(chapter, getUploadVideo);
                videoUrl = video;
                // updatedSections[i].chapters[j] = updatedChapter;
              } catch (error) {
                console.error(
                  `Failed to upload video for chapter ${chapter.chapterId}:`,
                  error,
                );
              }
            }
            let updatedChapter: Chapter = {
              chapterId: chapter.chapterId,
              title: chapter.title,
              content: chapter.content,
              type: chapter.type,
              sectionId: section.sectionId,
              order: chapterIndex,
            };
            if (videoUrl) {
              updatedChapter = { ...updatedChapter, video: videoUrl };
            }
            await updateChapter(updatedChapter).unwrap();
          }
        }
      }
      refetch();
      toast.success('Course updated successfully');
    } catch (error) {
      console.error('Failed to update course:', error);
      toast.error('Failed to update course');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-5 mb-5">
        <button
          className="flex items-center border border-customgreys-dirtyGrey rounded-lg p-2 gap-2"
          onClick={() => router.push('/teacher/courses', { scroll: false })}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Courses</span>
        </button>
      </div>

      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Header
            title="Course Setup"
            subtitle="Complete all fields and save your course"
            rightElement={
              <div className="flex items-center space-x-4">
                <CustomFormField
                  name="courseStatus"
                  label={methods.watch('courseStatus') ? 'Published' : 'Draft'}
                  type="switch"
                  className="flex items-center space-x-2"
                  labelClassName={`text-sm font-medium ${
                    methods.watch('courseStatus')
                      ? 'text-green-500'
                      : 'text-yellow-500'
                  }`}
                  inputClassName="data-[state=checked]:bg-green-500"
                />
                <Button
                  type="submit"
                  className="bg-primary-700 hover:bg-primary-600"
                >
                  {methods.watch('courseStatus')
                    ? 'Update Published Course'
                    : 'Save Draft'}
                </Button>
              </div>
            }
          />

          <div className="flex justify-between md:flex-row flex-col gap-10 mt-5 font-dm-sans">
            <div className="basis-1/2">
              <div className="space-y-4">
                <CustomFormField
                  name="courseTitle"
                  label="Course Title"
                  type="text"
                  placeholder="Write course title here"
                  className="border-none"
                  initialValue={course?.title}
                />

                <CustomFormField
                  name="courseDescription"
                  label="Course Description"
                  type="textarea"
                  placeholder="Write course description here"
                  initialValue={course?.description}
                />

                <CustomFormField
                  name="courseCategory"
                  label="Course Category"
                  type="select"
                  placeholder="Select category here"
                  options={[
                    { value: 'technology', label: 'Technology' },
                    { value: 'science', label: 'Science' },
                    { value: 'mathematics', label: 'Mathematics' },
                    {
                      value: 'Artificial Intelligence',
                      label: 'Artificial Intelligence',
                    },
                  ]}
                  initialValue={course?.category}
                />

                <CustomFormField
                  name="coursePrice"
                  label="Course Price"
                  type="number"
                  placeholder="0"
                  initialValue={course?.price}
                />
              </div>
            </div>

            <div className="bg-customgreys-darkGrey mt-4 md:mt-0 p-4 rounded-lg basis-1/2">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-semibold text-secondary-foreground">
                  Sections
                </h2>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    dispatch(openSectionModal({ sectionIndex: null }))
                  }
                  className="border-none text-primary-700 group"
                >
                  <Plus className="mr-1 h-4 w-4 text-primary-700 group-hover:white-100" />
                  <span className="text-primary-700 group-hover:white-100">
                    Add Section
                  </span>
                </Button>
              </div>

              {isLoading ? (
                <p>Loading course content...</p>
              ) : sections.length > 0 ? (
                <DroppableComponent />
              ) : (
                <p>No sections available</p>
              )}
            </div>
          </div>
        </form>
      </Form>

      <ChapterModal />
      <SectionModal />
    </div>
  );
};

export default CourseEditor;
