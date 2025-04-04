import { IsAlphanumeric, IsEmail, IsString, MinLength } from "class-validator";

export class CreateAuthDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsAlphanumeric()
    @MinLength(6)
    password: string;
}
