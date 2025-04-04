import { PartialType } from '@nestjs/mapped-types';
import { CreateSalesProductDto } from './create-sales-product.dto';

export class UpdateSalesProductDto extends PartialType(CreateSalesProductDto) {}
