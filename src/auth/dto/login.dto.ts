import { AuthType } from '@generated/prisma';
import {
    IsString,
    IsOptional,
    ValidateIf,
    IsEmail,
    IsEnum,
    IsNotEmpty,
} from 'class-validator';

export class LoginDto {
    @IsString()
    @IsOptional()
    first_name: string;

    @IsString()
    @IsOptional()
    last_name: string;

    @IsNotEmpty()
    @IsEnum(AuthType)
    auth_method: AuthType;

    @ValidateIf(o => o.auth_method === 'EMAIL_OTP' || o.auth_method === 'EMAIL_PW')
    @IsEmail()
    @IsString()
    @IsOptional()
    email?: string;

    @ValidateIf(o => o.auth_method === 'PHONE_OTP')
    @IsString()
    @IsOptional()
    phone_no?: string;

    @ValidateIf(o => o.auth_method === 'EMAIL_PW')
    @IsString()
    @IsOptional()
    password?: string;

    @ValidateIf(o => o.auth_method === 'EMAIL_OTP' || o.auth_method === 'PHONE_OTP')
    @IsString()
    @IsOptional()
    otp?: string;

    @ValidateIf(o => o.auth_method === 'GOOGLE' || o.auth_method === 'APPLE')
    @IsString()
    @IsOptional()
    provider_id: string


}
