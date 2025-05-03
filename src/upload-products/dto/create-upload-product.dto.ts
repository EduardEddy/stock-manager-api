import { IsNumber, IsOptional, IsString } from "class-validator"

export class CreateUploadProductDto {
  @IsString()
  name: string

  @IsNumber()
  price: number

  @IsNumber()
  stock: number

  @IsString()
  userId: string

  @IsString()
  @IsOptional()
  aditionalId: string
}
