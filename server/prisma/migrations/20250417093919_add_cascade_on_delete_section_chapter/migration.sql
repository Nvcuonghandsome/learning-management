-- DropForeignKey
ALTER TABLE "chapters" DROP CONSTRAINT "chapters_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_chapterId_fkey";

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("sectionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("chapterId") ON DELETE CASCADE ON UPDATE CASCADE;
