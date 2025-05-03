// src/sales/dto/update-sale-status.dto.ts
import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class UpdateSaleStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['PENDING', 'COMPLETED', 'CANCELLED'])
  status: string;
}