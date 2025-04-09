import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { User } from '@prisma/client';
import { UserService } from './user.service';

// @UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  // @Get('me')
  // getMe(@GetUser() user: Users) {
  //   return user;
  // }

  @Get('/')
  getUsers(
    @Query('search') search = '',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.userService.getUsers(search, page, limit);
  }
}
