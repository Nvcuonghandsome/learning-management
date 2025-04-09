import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();
const DEFAULT_PASSWORD = '123456';

async function hashPassword(password: string) {
  return await argon2.hash(password);
}

async function deleteAllData(orderedFileNames: string[]) {
  const modelNames = orderedFileNames.map((fileName) => {
    const modelName = path.basename(fileName, path.extname(fileName));
    return modelName.charAt(0).toUpperCase() + modelName.slice(1);
  });

  for (const modelName of modelNames) {
    const model: any = prisma[modelName as keyof typeof prisma];
    if (model) {
      await model.deleteMany({});
      console.log(`Cleared data from ${modelName}`);
    } else {
      console.error(
        `Model ${modelName} not found. Please ensure the model name is correctly specified.`,
      );
    }
  }
}

// Helper function to remove ID fields from objects
function removeIdFields(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => removeIdFields(item));
  } else if (obj && typeof obj === 'object') {
    const newObj = { ...obj };
    // Remove common ID fields
    delete newObj.id;
    delete newObj.courseId;
    delete newObj.sectionId;
    delete newObj.chapterId;
    delete newObj.commentId;
    delete newObj.userId;
    delete newObj.transactionId;
    delete newObj.userCourseProgressId;
    delete newObj.sectionProgressId;

    // Recursively process nested objects
    for (const key in newObj) {
      if (newObj[key] && typeof newObj[key] === 'object') {
        newObj[key] = removeIdFields(newObj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

async function main() {
  const dataDirectory = path.join(__dirname, 'seedData');

  const orderedFileNames = [
    'course.json',
    'transaction.json',
    'userCourseProgress.json',
  ];

  await deleteAllData(orderedFileNames);

  // Create mappings to store original IDs and their new generated IDs
  const courseIdMap: Record<string, string> = {};
  const userIdMap: Record<string, string> = {};

  // First, create users if they don't exist
  const userData = [
    {
      userId: 'user_2ntu96pUCljUV2T9W0AThzjacQB',
      email: 'user1@example.com',
      name: 'User One',
    },
    {
      userId: 'user_5vBn23WsLkMp7Jh4Gt8FxYcRz',
      email: 'user2@example.com',
      name: 'User Two',
    },
    {
      userId: 'user_6tHm89QwNpKj3Fx5Vy2RdLcBs',
      email: 'user3@example.com',
      name: 'User Three',
    },
    {
      userId: 'user_9xWp45MnKjL8vRt2Hs6BqDcEy',
      email: 'user4@example.com',
      name: 'User Four',
    },
    {
      userId: 'user_7kFh92JkCpQw3N8M5L4xRzVtYs',
      email: 'teacher1@example.com',
      name: 'Teacher One',
    },
    {
      userId: 'user_4mNj68RtPvXw2Ky9Qc7HbSdAf',
      email: 'teacher2@example.com',
      name: 'Teacher Two',
    },
  ];

  for (const user of userData) {
    const originalUserId = user.userId;
    const cleanUser = removeIdFields(user);

    // Create the user
    const createdUser = await prisma.user.create({
      data: {
        ...cleanUser,
        hash: await hashPassword(DEFAULT_PASSWORD),
      },
    });

    // Store the mapping between original and new userId
    userIdMap[originalUserId] = createdUser.userId;
  }

  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const modelName = path.basename(fileName, path.extname(fileName));
    const model: any = prisma[modelName as keyof typeof prisma];

    if (!model) {
      console.error(`No Prisma model matches the file name: ${fileName}`);
      continue;
    }

    // Special handling for courses to process nested relationships
    if (modelName === 'course') {
      for (const course of jsonData) {
        // Extract nested data before creating the course
        const enrollments = course.enrollments || [];
        const sections = course.sections || [];

        // Store the original courseId for mapping
        const originalCourseId = course.courseId;

        // Remove ID fields from all objects
        const cleanCourse = removeIdFields(course);
        delete cleanCourse.enrollments;
        delete cleanCourse.sections;

        // Create the course first
        const createdCourse = await prisma.course.create({
          data: cleanCourse,
        });

        // Store the mapping between original and new courseId
        courseIdMap[originalCourseId] = createdCourse.courseId;

        // Create enrollments for the course
        if (enrollments.length > 0) {
          const enrollmentData = enrollments
            .map((enrollment: any) => {
              // Make sure we have the required userId field
              if (!enrollment.userId) {
                console.error('Missing userId in enrollment data:', enrollment);
                return null;
              }

              // Get the new userId from the mapping
              const newUserId = userIdMap[enrollment.userId];
              if (!newUserId) {
                console.error(
                  `No mapping found for userId: ${enrollment.userId}`,
                );
                return null;
              }

              return {
                userId: newUserId,
                courseId: createdCourse.courseId,
              };
            })
            .filter(Boolean); // Remove any null entries

          if (enrollmentData.length > 0) {
            await prisma.enrollment.createMany({
              data: enrollmentData,
            });
          }
        }

        // Create sections and their nested relationships
        for (const section of sections) {
          const chapters = section.chapters || [];
          const cleanSection = removeIdFields(section);
          delete cleanSection.chapters;

          // Create the section
          const createdSection = await prisma.section.create({
            data: {
              ...cleanSection,
              courseId: createdCourse.courseId,
            },
          });

          // Create chapters and their comments
          for (const chapter of chapters) {
            const comments = chapter.comments || [];
            const cleanChapter = removeIdFields(chapter);
            delete cleanChapter.comments;

            // Create the chapter
            const createdChapter = await prisma.chapter.create({
              data: {
                ...cleanChapter,
                sectionId: createdSection.sectionId,
              },
            });

            // Create comments for the chapter
            if (comments.length > 0) {
              const commentData = comments
                .map((comment: any) => {
                  // Make sure we have the required userId field
                  if (!comment.userId) {
                    console.error('Missing userId in comment data:', comment);
                    return null;
                  }

                  // Get the new userId from the mapping
                  const newUserId = userIdMap[comment.userId];
                  if (!newUserId) {
                    console.error(
                      `No mapping found for userId: ${comment.userId}`,
                    );
                    return null;
                  }

                  const cleanComment = removeIdFields(comment);
                  return {
                    ...cleanComment,
                    userId: newUserId,
                    chapterId: createdChapter.chapterId,
                  };
                })
                .filter(Boolean); // Remove any null entries

              if (commentData.length > 0) {
                await prisma.comment.createMany({
                  data: commentData,
                });
              }
            }
          }
        }
      }
    } else if (modelName === 'transaction') {
      // Special handling for transactions to ensure required fields
      const transactionData = jsonData
        .map((transaction: any) => {
          // Make sure we have the required fields
          if (!transaction.userId || !transaction.courseId) {
            console.error(
              'Missing required fields in transaction data:',
              transaction,
            );
            return null;
          }

          // Get the new courseId from the mapping
          const newCourseId = courseIdMap[transaction.courseId];
          if (!newCourseId) {
            console.error(
              `No mapping found for courseId: ${transaction.courseId}`,
            );
            return null;
          }

          // Get the new userId from the mapping
          const newUserId = userIdMap[transaction.userId];
          if (!newUserId) {
            console.error(`No mapping found for userId: ${transaction.userId}`);
            return null;
          }

          const cleanTransaction = removeIdFields(transaction);
          return {
            ...cleanTransaction,
            userId: newUserId,
            courseId: newCourseId,
          };
        })
        .filter(Boolean); // Remove any null entries

      if (transactionData.length > 0) {
        await prisma.transaction.createMany({
          data: transactionData,
        });
      }
    } else if (modelName === 'userCourseProgress') {
      // Special handling for userCourseProgress to ensure required fields
      for (const progress of jsonData) {
        // Make sure we have the required fields
        if (!progress.userId || !progress.courseId) {
          console.error('Missing required fields in progress data:', progress);
          continue;
        }

        // Get the new courseId from the mapping
        const newCourseId = courseIdMap[progress.courseId];
        if (!newCourseId) {
          console.error(`No mapping found for courseId: ${progress.courseId}`);
          continue;
        }

        // Get the new userId from the mapping
        const newUserId = userIdMap[progress.userId];
        if (!newUserId) {
          console.error(`No mapping found for userId: ${progress.userId}`);
          continue;
        }

        // Extract sections data before cleaning
        const sections = progress.sections || [];

        // Clean the progress data
        const cleanProgress = removeIdFields(progress);
        delete cleanProgress.sections; // Remove sections as we'll handle them separately

        // Create the userCourseProgress record
        const createdProgress = await prisma.userCourseProgress.create({
          data: {
            ...cleanProgress,
            userId: newUserId,
            courseId: newCourseId,
          },
        });

        // Create section progress records if they exist
        if (sections.length > 0) {
          for (const section of sections) {
            const chapters = section.chapters || [];
            const cleanSection = removeIdFields(section);
            delete cleanSection.chapters;

            // Create the section progress record
            const createdSectionProgress = await prisma.sectionProgress.create({
              data: {
                ...cleanSection,
                userCourseProgressId: createdProgress.id,
                sectionId: section.sectionId,
              },
            });

            // Create chapter progress records if they exist
            if (chapters.length > 0) {
              const chapterProgressData = chapters.map((chapter: any) => {
                const cleanChapter = removeIdFields(chapter);
                return {
                  ...cleanChapter,
                  sectionProgressId: createdSectionProgress.id,
                };
              });

              await prisma.chapterProgress.createMany({
                data: chapterProgressData,
              });
            }
          }
        }
      }
    } else {
      // For other models, remove ID fields before creating
      const cleanData = removeIdFields(jsonData);
      await model.createMany({ data: cleanData });
    }

    console.log(`Seeded ${modelName} with data from ${fileName}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
