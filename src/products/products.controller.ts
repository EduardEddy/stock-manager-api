import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { GetUser } from 'src/auth/decorators/get-user.decorators';
import { AuthGuard } from '@nestjs/passport';

@Controller('products')
@UseGuards(AuthGuard())
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  create(@Body() createProductDto: CreateProductDto, @GetUser() user) {
    return this.productsService.create(createProductDto, user.id);
  }

  @Get()
  findAll(@GetUser() user) {
    return this.productsService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user) {
    return this.productsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @GetUser() user) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user) {
    return this.productsService.remove(+id);
  }
}
