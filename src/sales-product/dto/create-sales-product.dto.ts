import { IsArray, IsNumber, IsPositive, IsString, IsUUID, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

export class SaleItemDto {
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


// DTO principal para la venta completa
export class CreateSalesProductDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @IsString()
  saleMediaId: string;

  @IsNumber({
    allowNaN: false,
    maxDecimalPlaces: 2,
  })
  totalAmount: number;
}