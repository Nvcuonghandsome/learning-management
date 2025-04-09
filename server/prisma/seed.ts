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

async function main() {
  console.log('path', path);
  console.log('__dirname', __dirname);
  const dataDirectory = path.join(__dirname, 'seedData');

  const orderedFileNames = [
    'courses.json',
    'transactions.json',
    'userCourseProgress.json',
  ];

  await deleteAllData(orderedFileNames);

  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const modelName = path.basename(fileName, path.extname(fileName));
    const model: any = prisma[modelName as keyof typeof prisma];

    if (!model) {
      console.error(`No Prisma model matches the file name: ${fileName}`);
      continue;
    }

    // Handle password hashing for the Users model
    if (modelName === 'users') {
      for (const user of jsonData) {
        user.hash = await hashPassword(DEFAULT_PASSWORD);
      }
    }

    await model.createMany({ data: jsonData });

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
