// src/sales/dto/cancel-sale.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CancelSaleDto {
  @IsNotEmpty()
  @IsString()
  reason: string;
}