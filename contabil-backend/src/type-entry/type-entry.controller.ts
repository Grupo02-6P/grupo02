import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TypeEntryService } from './type-entry.service';
import { CreateTypeEntryDto } from './dto/create-type-entry.dto';
import { UpdateTypeEntryDto } from './dto/update-type-entry.dto';
import { FilterTypeEntryDto } from './dto/filter-type-entry.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('type-entry')
export class TypeEntryController {
  constructor(private readonly typeEntryService: TypeEntryService) {}

  @Post()
  create(@Body() createTypeEntryDto: CreateTypeEntryDto) {
    return this.typeEntryService.create(createTypeEntryDto);
  }

  @Get()
  findAll(@Query() filterDto: FilterTypeEntryDto) {
    return this.typeEntryService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.typeEntryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTypeEntryDto: UpdateTypeEntryDto) {
    return this.typeEntryService.update(id, updateTypeEntryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.typeEntryService.remove(id);
  }

  @Patch(':id/inactivate')
  inactive(@Param('id') id: string) {
    return this.typeEntryService.inactivate(id);
  }
}
