import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommonDto } from 'src/auth/dto/common.dto';
import * as bcrypt from 'bcrypt';
import { decryptData, hashPassword } from '@/common/helper/common.helper';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
  ) { }
  async getCurrentUser(userId: bigint) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone_no: true,
          image: true,
          auth_method: true,
          dob: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
          is_deleted: true,
          is_temporary: true,
          created_at: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateUserProfile(userId: bigint, commonDto: CommonDto) {
    try {
      const payload = decryptData(commonDto.data);

      const {
        email,
        phone_no,
        first_name,
        last_name,
        dob,
        old_password,
        new_password,
        onboardingStatus,
        country_id,
        currency_id
      } = payload;

      const findUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!findUser) {
        throw new BadRequestException('User not found');
      }

      const updateData: any = {};

      if (email) updateData.email = email.toLowerCase();
      if (phone_no) updateData.phone_no = phone_no;
      if (first_name) updateData.first_name = first_name;
      if (last_name) updateData.last_name = last_name;

      const hasOld = !!old_password;
      const hasNew = !!new_password;
      let passwordChanged = false;
      if (hasOld || hasNew) {
        if (!hasOld) {
          throw new BadRequestException('Old password is required');
        }

        if (!hasNew) {
          throw new BadRequestException('New password is required');
        }

        if (!findUser.password) {
          throw new BadRequestException('Password not set for this account');
        }

        const isMatch = await bcrypt.compare(old_password, findUser.password);

        if (!isMatch) {
          throw new BadRequestException('Old password is incorrect');
        }
        updateData.password = await hashPassword(new_password);
        passwordChanged = true;
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
      if (passwordChanged) {
        await this.prisma.userSession.updateMany({
          where: {
            user_id: userId,
            revoked: false,
          },
          data: {
            revoked: true,
            last_used_at: new Date(),
          },
        });
      }
      return this.getCurrentUser(userId);
    } catch (error) {
      throw error
    }
  }

  async updateProfileImage(userId: bigint, isDelete: boolean, file: { key?: string }) {
    try {
      let dataToUpdate: any = {};

      if (isDelete) {
        dataToUpdate.image = null;
      } else if (file?.key) {
        dataToUpdate.image = file.key;
      }

      const res = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: dataToUpdate,
      });

      const { password, ...user } = res;
      return user;
    } catch (error) {
      throw error;
    }
  }



}
