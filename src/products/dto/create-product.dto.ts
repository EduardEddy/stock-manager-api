import { IsDecimal, IsInt, IsNumber, IsPositive, IsString } from "class-validator"

export class CreateProductDto {
  @IsString()
  name: string

  @IsNumber()
  @IsPositive()
  price: number

  @IsNumber()
  @IsPositive()
  @IsInt()
  stock: number

  @IsNumber({
    allowNaN: false,
    maxDecimalPlaces: 2,
  })
  @IsPositive()
  priceDollar

  @IsNumber({
    allowNaN: false,
    maxDecimalPlaces: 2,
  })
  @IsPositive()
  priceBuyLocalCurrency
}
