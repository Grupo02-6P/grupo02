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
import { TypeMovementService } from './type-movement.service';
import { CreateTypeMovementDto } from './dto/create-type-movement.dto';
import { UpdateTypeMovementDto } from './dto/update-type-movement.dto';
import { FilterTypeMovementDto } from './dto/filter-type-movement.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('type-movement')
export class TypeMovementController {
  constructor(private readonly typeMovementService: TypeMovementService) {}

  @Post()
  create(@Body() createTypeMovementDto: CreateTypeMovementDto) {
    return this.typeMovementService.create(createTypeMovementDto);
  }

  @Get()
  findAll(@Query() filterDto: FilterTypeMovementDto) {
    return this.typeMovementService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.typeMovementService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTypeMovementDto: UpdateTypeMovementDto,
  ) {
    return this.typeMovementService.update(id, updateTypeMovementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.typeMovementService.remove(id);
  }

  @Patch(':id/inactivate')
  inactive(@Param('id') id: string) {
    return this.typeMovementService.inactivate(id);
  }
}
