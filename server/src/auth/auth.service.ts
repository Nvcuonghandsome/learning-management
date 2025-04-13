import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto, SignUpDto } from './dto';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: SignUpDto) {
    // const hashPwd = await argon.hash(dto.password);
    // try {
    //   const newsUser = await this.prisma.user.create({
    //     data: {
    //       email: dto.email,
    //       name: dto.name,
    //       hash: hashPwd,
    //     },
    //     select: {
    //       userId: true,
    //       email: true,
    //       name: true,
    //       createdAt: true,
    //       updatedAt: true,
    //     },
    //   });
    //   return this.signToken(newsUser.userId, newsUser.email);
    // } catch (error) {
    //   if (error instanceof PrismaClientKnownRequestError) {
    //     if (error.code === 'P2002') {
    //       throw new ForbiddenException('Credentials taken');
    //     }
    //   }
    //   throw error;
    // }
  }

  async login(dto: LoginDto) {
    // const user = await this.prisma.user.findUnique({
    //   where: { email: dto.email },
    // });
    // if (!user) throw new ForbiddenException('Invalid credentials');
    // const isPwdMatch = await argon.verify(user.hash, dto.password);
    // if (!isPwdMatch) throw new ForbiddenException('Invalid credentials');
    // return this.signToken(user.userId, user.email);
  }

  async signToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string }> {
    const data = {
      sub: userId,
      email,
    };
    const secretToken = this.config.get('JWT_SECRET');
    const token_ttl = this.config.get('JWT_TTL');
    const token = await this.jwt.signAsync(data, {
      expiresIn: token_ttl,
      secret: secretToken,
    });

    return {
      access_token: token,
    };
  }
}
