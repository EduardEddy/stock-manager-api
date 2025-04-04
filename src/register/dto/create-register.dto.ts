import { IsEmail, IsOptional, IsPhoneNumber, IsString } from "class-validator";

export class CreateRegisterDto {
    @IsString()
    name: string;

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @IsPhoneNumber()
    @IsOptional()
    phoneNumber: string;

    @IsString()
    password: string;
}
