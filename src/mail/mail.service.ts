import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MailService {
    constructor(
        private readonly mailer: MailerService,
        private prisma: PrismaService,
    ) { }

    async sendOTPEmail(subject: string, email: string, otp: string) {
        try {
            const mailOptions = {
                to: email,
                subject: subject,
                template: './otp-email',
                context: {
                    otp: otp,
                    currentYear: new Date().getFullYear()
                }
            };
            await this.mailer.sendMail(mailOptions);
        } catch (error) {
            throw error
        }
    }

    async sendResetPasswordEmail(email: string, resetLink: string, token: string = '', expiry_minutes: number) {
        const mailOptions = {
            to: email,
            subject: 'Reset your password',
            template: './forgot-password',
            context: {
                code: token,
                expiry_minutes: expiry_minutes,
                currentYear: new Date().getFullYear(),
                reset_link: resetLink,
            }
        };

        await this.mailer.sendMail(mailOptions);
    }
}