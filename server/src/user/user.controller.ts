import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClerkGuard, JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { User } from '@prisma/client';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/user.dto';

// @UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  // @Get('me')
  // getMe(@GetUser() user: Users) {
  //   return user;
  // }

  // @Get('/')
  // getUsers(
  //   @Query('search') search = '',
  //   @Query('page') page?: string,
  //   @Query('limit') limit?: string,
  // ) {
  //   return this.userService.getUsers(search, page, limit);
  // }

  @UseGuards(ClerkGuard)
  @Put('/clerk/:userId')
  updateClerkUserMetadata(
    @Param('userId') userId: string,
    @Body() metadata: UpdateUserDto,
  ) {
    return this.userService.updateClerkUserMetadata(userId, metadata);
  }
}
