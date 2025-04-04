import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SalesProductService } from './sales-product.service';
import { CreateSalesProductDto } from './dto/create-sales-product.dto';
import { UpdateSalesProductDto } from './dto/update-sales-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorators';

@Controller('sales-product')
@UseGuards(AuthGuard())
export class SalesProductController {
  constructor(private readonly salesProductService: SalesProductService) { }

  @Post()
  create(@Body() createSalesProductDto: CreateSalesProductDto, @GetUser() user) {
    return this.salesProductService.create(createSalesProductDto, user.id);
  }

  @Get()
  findAll(@GetUser() user) {
    return this.salesProductService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesProductService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSalesProductDto: UpdateSalesProductDto) {
    return this.salesProductService.update(+id, updateSalesProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesProductService.remove(+id);
  }
}
