import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class SendOtpDto {
    @IsString({ message: "credential must be a string" })
    @IsNotEmpty({ message: "credential should not be empty" })
    credential: string;

    @IsBoolean()
    is_email: boolean;
}