import { PartialType } from '@nestjs/mapped-types';
import { CreateUploadProductDto } from './create-upload-product.dto';

export class UpdateUploadProductDto extends PartialType(CreateUploadProductDto) {}
