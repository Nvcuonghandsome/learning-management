-- CreateEnum
CREATE TYPE "CourseLevel" AS ENUM ('Beginner', 'Intermediate', 'Advanced');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('Draft', 'Published');

-- CreateEnum
CREATE TYPE "ChapterType" AS ENUM ('Text', 'Quiz', 'Video');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('stripe');

-- CreateTable
CREATE TABLE "courses" (
    "courseId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "teacherName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "image" TEXT,
    "price" DOUBLE PRECISION,
    "level" "CourseLevel" NOT NULL,
    "status" "CourseStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("courseId")
);

-- CreateTable
CREATE TABLE "sections" (
    "sectionId" TEXT NOT NULL,
    "sectionTitle" TEXT NOT NULL,
    "sectionDescription" TEXT,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("sectionId")
);

-- CreateTable
CREATE TABLE "chapters" (
    "chapterId" TEXT NOT NULL,
    "type" "ChapterType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "videoLength" INTEGER,
    "videoType" TEXT,
    "videoUniqueId" TEXT,
    "videoUrl" TEXT,
    "video" TEXT,
    "sectionId" TEXT NOT NULL,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("chapterId")
);

-- CreateTable
CREATE TABLE "comments" (
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("commentId")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "transactionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateTime" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "paymentProvider" "PaymentProvider" NOT NULL,
    "amount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("transactionId")
);

-- CreateTable
CREATE TABLE "UserCourseProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "enrollmentDate" TEXT NOT NULL,
    "overallProgress" DOUBLE PRECISION NOT NULL,
    "lastAccessedTimestamp" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCourseProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectionProgress" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "userCourseProgressId" TEXT NOT NULL,

    CONSTRAINT "SectionProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChapterProgress" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "sectionProgressId" TEXT NOT NULL,

    CONSTRAINT "ChapterProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseTransactionsIndex" ON "transactions"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCourseProgress_userId_courseId_key" ON "UserCourseProgress"("userId", "courseId");

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("sectionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("chapterId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCourseProgress" ADD CONSTRAINT "UserCourseProgress_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectionProgress" ADD CONSTRAINT "SectionProgress_userCourseProgressId_fkey" FOREIGN KEY ("userCourseProgressId") REFERENCES "UserCourseProgress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterProgress" ADD CONSTRAINT "ChapterProgress_sectionProgressId_fkey" FOREIGN KEY ("sectionProgressId") REFERENCES "SectionProgress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
