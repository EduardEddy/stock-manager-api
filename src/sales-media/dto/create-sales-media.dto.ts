import { IsString } from "class-validator";

export class CreateSalesMediaDto {

  @IsString()
  name: string;

  @IsString()
  userId: string;
}
