import { PartialType } from '@nestjs/mapped-types';
import { CreateSalesMediaDto } from './create-sales-media.dto';

export class UpdateSalesMediaDto extends PartialType(CreateSalesMediaDto) {}
