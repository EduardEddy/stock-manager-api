import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorators';
import { AuthGuard } from '@nestjs/passport';

//@Controller('sale')
@Controller('sales-product')
@UseGuards(AuthGuard())
export class SaleController {
  constructor(private readonly saleService: SaleService) { }

  @Post()
  create(@Body() createSaleDto: CreateSaleDto, @GetUser() user) {
    return this.saleService.create(user.id, createSaleDto);
  }

  @Get()
  findAll(@GetUser() user) {
    return this.saleService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user) {
    return this.saleService.findOne(user.id, id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto, @GetUser() user) {
    return this.saleService.updateStatus(user.id, id, updateSaleDto.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user) {
    return this.saleService.cancel(user.id, id, 'Cancelado por el usuario');
  }
}
