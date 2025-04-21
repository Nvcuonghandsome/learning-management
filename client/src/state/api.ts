import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BaseQueryApi, FetchArgs } from '@reduxjs/toolkit/query';
import { User } from '@clerk/nextjs/server';
import { Clerk } from '@clerk/clerk-js';
import { toast } from 'sonner';

const customBaseQuery = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: any,
) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      const token = await window.Clerk?.session?.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  });

  try {
    const result: any = await baseQuery(args, api, extraOptions);
    if (result.error) {
      const errorData = result.error.data;
      const errorMessage =
        errorData?.message ||
        result.error.status.toString() ||
        'An error occurred!';
      toast.error(errorMessage);
    }

    const isMutationRequest =
      (args as FetchArgs)?.method && (args as FetchArgs)?.method !== 'GET';
    if (isMutationRequest && result.data?.message) {
      toast.success(result.data.message);
    }

    if (result.data) {
      result.data = result.data.data;
    } else if (
      result.error?.status === 204 ||
      result.meta?.response?.status === 204
    ) {
      return { data: null };
    }
    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return { error: { status: 'FETCH_ERROR', error: errorMessage } };
  }
};

export const api = createApi({
  baseQuery: customBaseQuery,
  reducerPath: 'api',
  tagTypes: ['Courses', 'Users', 'UserCourseProgress'],
  endpoints: (build) => ({
    /*
      COURSE API
    */
    getCourses: build.query<
      Course[],
      {
        category?: string;
        search?: string;
        page?: string;
        limit?: string;
      }
    >({
      query: ({ category, search, page, limit }) => ({
        url: '/courses',
        params: { category, search, page, limit },
      }),
      providesTags: ['Courses'],
    }),
    getCourse: build.query<Course, string>({
      query: (id) => ({
        url: `/courses/${id}`,
      }),
      // only update data of course with id on FE
      providesTags: (result, error, id) => [{ type: 'Courses', id }],
    }),
    createCourse: build.mutation<Partial<Course>, Partial<Course>>({
      query: (body) => ({
        url: '/courses/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Courses'],
    }),
    updateCourse: build.mutation<Partial<Course>, Partial<Course>>({
      query: ({ courseId, ...body }) => ({
        url: `/courses/update/${courseId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: 'Courses', id: courseId },
      ],
    }),
    deleteCourse: build.mutation<{ message: string }, { courseId: string }>({
      query: ({ courseId }) => ({
        url: `/courses/delete/${courseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: 'Courses', id: courseId },
      ],
    }),
    createSection: build.mutation<Partial<Section>, Partial<Section>>({
      query: (body) => ({
        url: '/courses/section/create',
        method: 'POST',
        body,
      }),
    }),
    updateSection: build.mutation<Partial<Section>, Partial<Section>>({
      query: ({ sectionId, ...body }) => ({
        url: `/courses/section/update/${sectionId}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteSection: build.mutation<{ message: string }, { sectionId: string }>({
      query: ({ sectionId }) => ({
        url: `/courses/section/delete/${sectionId}`,
        method: 'DELETE',
      }),
    }),
    createChapter: build.mutation<Partial<Chapter>, Partial<Chapter>>({
      query: (body) => ({
        url: '/courses/chapter/create',
        method: 'POST',
        body,
      }),
    }),
    updateChapter: build.mutation<Partial<Chapter>, Partial<Chapter>>({
      query: ({ chapterId, ...body }) => ({
        url: `/courses/chapter/update/${chapterId}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteChapter: build.mutation<{ message: string }, { chapterId: string }>({
      query: ({ chapterId }) => ({
        url: `/courses/chapter/delete/${chapterId}`,
        method: 'DELETE',
      }),
    }),
    /*
      COURSE PROGRESS API
    */
    getUserEnrolledCourses: build.query<UserCourseProgress[], string>({
      query: (userId) => ({
        url: `/courses/progress/user-enrolled-courses/${userId}`,
      }),
      providesTags: ['Courses', 'UserCourseProgress'],
    }),
    getUserCourseProgress: build.query<
      UserCourseProgress,
      { userId: string; courseId: string }
    >({
      query: ({ userId, courseId }) => ({
        url: `/courses/progress/user-course-progress`,
        params: { userId, courseId },
      }),
      providesTags: ['UserCourseProgress'],
    }),
    updateUserCourseProgress: build.mutation<
      UserCourseProgress,
      { userId: string; courseId: string; progressData: any }
    >({
      query: (data) => ({
        url: `/courses/progress/user-course-progress`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['UserCourseProgress'],
    }),
    /*
      USER API
    */
    updateUser: build.mutation<User, Partial<User> & { userId: string }>({
      query: ({ userId, ...updatedUser }) => ({
        url: `users/clerk/${userId}`,
        method: 'PUT',
        body: updatedUser,
      }),
      invalidatesTags: ['Users'],
    }),
    /*
      TRANSACTION API
    */
    createPaymentIntent: build.mutation<
      { clientSecret: string },
      { amount: number }
    >({
      query: ({ amount }) => ({
        url: 'transactions/payment-intent',
        method: 'POST',
        body: { amount },
      }),
    }),
    createTransaction: build.mutation<Transaction, Partial<Transaction>>({
      query: (transaction) => ({
        url: '/transactions/create-transaction',
        method: 'POST',
        body: transaction,
      }),
    }),
    getTransactionList: build.query<Transaction[], string>({
      query: (userId) => ({
        url: `/transactions/list?userId=${userId}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
  useCreateChapterMutation,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
  useGetUserEnrolledCoursesQuery,
  useGetUserCourseProgressQuery,
  useUpdateUserCourseProgressMutation,
  useUpdateUserMutation,
  useCreatePaymentIntentMutation,
  useCreateTransactionMutation,
  useGetTransactionListQuery,
} = api;
