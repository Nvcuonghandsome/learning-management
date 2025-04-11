import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/user.dto';
import { ConfigService } from '@nestjs/config';
import { ClerkService } from 'src/clerk/clerk.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private clerk: ClerkService,
  ) {}

  // async getUsers(search: string, page?: string, limit?: string) {
  //   const take = limit ? parseInt(limit, 10) : undefined;
  //   const skip = page && take ? (parseInt(page, 10) - 1) * take : undefined;

  //   const users = await this.prisma.user.findMany({
  //     where: search
  //       ? {
  //           OR: [
  //             {
  //               name: {
  //                 contains: search,
  //                 mode: 'insensitive',
  //               },
  //             },
  //             {
  //               email: {
  //                 contains: search,
  //                 mode: 'insensitive',
  //               },
  //             },
  //           ],
  //         }
  //       : {},
  //     take,
  //     skip,
  //     select: {
  //       userId: true,
  //       name: true,
  //       email: true,
  //       createdAt: true,
  //       updatedAt: true,
  //     },
  //   });

  //   return users;
  // }

  async updateClerkUserMetadata(userId: string, metadata: UpdateUserDto) {
    try {
      const updatedUser = await this.clerk.users.updateUserMetadata(userId, {
        publicMetadata: {
          userType: metadata.publicMetadata.userType,
          settings: metadata.publicMetadata.settings,
        },
      });

      return {
        message: 'User updated successfully!',
        data: updatedUser,
      };
    } catch (error) {
      console.error('Failed to update user in Clerk:', error);
      throw error;
    }
  }
}
