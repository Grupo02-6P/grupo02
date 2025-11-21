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
import { TitleService } from './title.service';
import { CreateTitleDto } from './dto/create-title.dto';
import { UpdateTitleDto } from './dto/update-title.dto';
import { BaseFilterDto } from 'src/common/dto/base-filter.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('title')
export class TitleController {
  constructor(private readonly titleService: TitleService) {}

  @Post()
  create(@Body() createTitleDto: CreateTitleDto) {
    return this.titleService.create(createTitleDto);
  }

  @Get()
  findAll(@Query() filterDto: BaseFilterDto) {
    return this.titleService.findAll(filterDto);
  }

  @Patch(':id/inactivate')
  inactive(@Param('id') id: string) {
    return this.titleService.inactivate(id);
  }

  @Patch(':id/pay')
  pay(@Param('id') id: string) {
    return this.titleService.pay(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.titleService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTitleDto: UpdateTitleDto) {
    return this.titleService.update(id, updateTitleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.titleService.remove(id);
  }
}
