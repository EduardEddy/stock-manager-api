import { IsNumber, IsPositive, IsString, IsUUID } from "class-validator"

export class CreateSalesProductDto {
  @IsString()
  @IsUUID()
  productId

  @IsNumber({
    allowNaN: false,
  })
  @IsPositive()
  quantity

  @IsNumber({
    allowNaN: false,
    maxDecimalPlaces: 2,
  })
  totalAmount

  @IsNumber({
    allowNaN: false,
    maxDecimalPlaces: 2,
  })
  unitPrice

  @IsNumber({
    allowNaN: false,
    maxDecimalPlaces: 2,
  })
  newPrice

  @IsString()
  saleMediaId
}
