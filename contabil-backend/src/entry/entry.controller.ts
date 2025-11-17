import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EntryService } from './entry.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { BaseFilterDto } from 'src/common/dto/base-filter.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('entry')
export class EntryController {
  constructor(private readonly entryService: EntryService) {}

  @Post()
  create(@Body() createEntryDto: CreateEntryDto) {
    return this.entryService.create(createEntryDto);
  }

  @Get()
  findAll() {
    return this.entryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.entryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateEntryDto: UpdateEntryDto) {
    return this.entryService.update(id, updateEntryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.entryService.remove(id);
  }
}
