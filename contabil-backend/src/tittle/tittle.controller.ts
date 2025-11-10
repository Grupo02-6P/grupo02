import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TittleService } from './tittle.service';
import { CreateTittleDto } from './dto/create-tittle.dto';
import { UpdateTittleDto } from './dto/update-tittle.dto';

@Controller('tittle')
export class TittleController {
  constructor(private readonly tittleService: TittleService) {}

  @Post()
  create(@Body() createTittleDto: CreateTittleDto) {
    return this.tittleService.create(createTittleDto);
  }

  @Get()
  findAll() {
    return this.tittleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tittleService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTittleDto: UpdateTittleDto) {
    return this.tittleService.update(id, updateTittleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tittleService.remove(id);
  }
}
