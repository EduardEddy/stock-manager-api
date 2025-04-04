import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SalesMediaService } from './sales-media.service';
import { CreateSalesMediaDto } from './dto/create-sales-media.dto';
import { UpdateSalesMediaDto } from './dto/update-sales-media.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorators';

@Controller('sales-media')
@UseGuards(AuthGuard())
export class SalesMediaController {
  constructor(private readonly salesMediaService: SalesMediaService) { }

  @Post()
  create(@Body() createSalesMediaDto: CreateSalesMediaDto) {
    return this.salesMediaService.create(createSalesMediaDto);
  }

  @Get()
  findAll(@GetUser() user) {
    return this.salesMediaService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesMediaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSalesMediaDto: UpdateSalesMediaDto) {
    return this.salesMediaService.update(+id, updateSalesMediaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesMediaService.remove(+id);
  }
}
