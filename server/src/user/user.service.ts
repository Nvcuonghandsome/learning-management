import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUsers(search: string, page?: string, limit?: string) {
    const take = limit ? parseInt(limit, 10) : undefined;
    const skip = page && take ? (parseInt(page, 10) - 1) * take : undefined;

    const users = await this.prisma.user.findMany({
      where: search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {},
      take,
      skip,
      select: {
        userId: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return users;
  }
}
