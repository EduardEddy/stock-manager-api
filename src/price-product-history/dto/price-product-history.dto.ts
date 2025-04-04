import { IsNumber, IsOptional, IsPositive, IsString, IsUUID } from "class-validator"

export class PriceProductHistoryDto {

  @IsString()
  @IsUUID()
  productId

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

  @IsNumber({
    allowNaN: false,
    maxDecimalPlaces: 2,
  })
  @IsPositive()
  priceSaleLocalCurrency

  @IsOptional()
  @IsString()
  reason

  @IsOptional()
  @IsString()
  changedBy
}
