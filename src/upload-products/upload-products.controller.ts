import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Req } from '@nestjs/common';
import { UploadProductsService } from './upload-products.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as XLSX from 'xlsx';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorators';
import * as multer from 'multer';

interface DataInterface {
  precio: number,
  stock: number,
  nombre: string,
}

@Controller('upload-products')
@UseGuards(AuthGuard())
export class UploadProductsController {
  constructor(private readonly uploadProductsService: UploadProductsService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadFile(@UploadedFile() file, @GetUser() user, @Req() req: Request) {

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    const records = [];
    data.map((element: DataInterface) => {
      const { nombre, precio, stock } = element;
      records.push({
        name: nombre,
        price: precio,
        stock: stock,
        userId: user.id
      })
    })

    return this.uploadProductsService.create(records);
  }
}
