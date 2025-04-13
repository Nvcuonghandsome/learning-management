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
  tagTypes: ['Courses', 'Users'],
  endpoints: (build) => ({
    getCourses: build.query<Course[], { category?: string }>({
      query: ({ category }) => ({
        url: '/courses',
        params: { category },
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
    updateUser: build.mutation<User, Partial<User> & { userId: string }>({
      query: ({ userId, ...updatedUser }) => ({
        url: `users/clerk/${userId}`,
        method: 'PUT',
        body: updatedUser,
      }),
      invalidatesTags: ['Users'],
    }),
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
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseQuery,
  useUpdateUserMutation,
  useCreatePaymentIntentMutation,
  useCreateTransactionMutation,
} = api;
