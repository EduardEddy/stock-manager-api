/*import { IsDecimal, IsInt, IsNumber, IsOptional, IsPositive, IsString } from "class-validator"

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

  @IsString()
  @IsOptional()
  aditionalId: string
}*/

import { IsString, IsNumber, IsOptional, Min, IsUrl, IsUUID, IsPositive } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  initialStock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumStock?: number;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  priceDollar?: number;

  @IsOptional()
  @IsUrl()
  imagePath?: string;

  @IsOptional()
  @IsString()
  aditionalId?: string;

  @IsNumber({
    allowNaN: false,
    maxDecimalPlaces: 2,
  })
  @IsPositive()
  priceBuyLocalCurrency?: number;
}

export class AddStockDto {
  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  reference: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePriceDto {
  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsString()
  reason?: string;
}