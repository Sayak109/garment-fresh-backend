import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OtpModule } from '@/otp/otp.module';
import { MailModule } from '@/mail/mail.module';
import { AuthRateLimitGuard } from '@/common/guards/auth-rate-limit.guard';
import { AuthRateLimitService } from '@/common/services/auth-rate-limit.service';

@Module({
    imports: [OtpModule, MailModule, JwtModule.register({})],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        JwtService,
        ConfigService,
        AuthRateLimitGuard,
        AuthRateLimitService,
    ],
})
export class AuthModule { }
