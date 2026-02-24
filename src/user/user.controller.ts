import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus, Res, BadRequestException, UploadedFile, UseInterceptors, Req, UploadedFiles, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { GetCurrentUserId } from 'src/common/decorators/current-user-id.decorator';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CommonDto } from 'src/auth/dto/common.dto';
import { AnyFilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiResponse } from '@/common/helper/response.helper';
import { decryptData, encryptData } from '@/common/helper/common.helper';
import { Account } from '@/common/enum/account.enum';
import { AccountStatus } from '@/common/decorators/status.decorator';
import { AccountStatusGuard } from '@/common/guards/status.guard';
import { upload } from '@/common/config/multer.config';
import slugify from 'slugify';

@Controller({ path: 'user', version: '1' })
export class UserController {
  constructor(private readonly userService: UserService) { }

  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @AccountStatus(Account.ACTIVE)
  @Get('me')
  async getCurrentUser(
    @GetCurrentUserId() userId: bigint,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      const userData = await this.userService.getCurrentUser(userId);
      let result = JSON.stringify(userData, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      );
      const resData = new ApiResponse((JSON.parse(result)), "Fetched user data");
      return res.status(HttpStatus.OK).json({ data: resData });
    } catch (error: any) {
      if (error.status && error.response) {
        return res.status(error.status).json(error.response);
      }
      throw new BadRequestException("Failed to read user data.");
    }
  }


  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @AccountStatus(Account.ACTIVE)
  @Patch('profile')
  async updateUserProfile(
    @GetCurrentUserId() userId: bigint,
    @Body() dto: CommonDto,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      const userData = await this.userService.updateUserProfile(userId, dto);
      let result = JSON.stringify(userData, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      );
      const resData = encryptData(new ApiResponse((JSON.parse(result)), "User profile updated successfully."));
      return res.status(HttpStatus.OK).json({ data: resData });
    } catch (error: any) {
      if (error.status && error.response) {
        return res.status(error.status).json(error.response);
      }
      throw new BadRequestException("Failed to update user profile.");
    }
  }

}
