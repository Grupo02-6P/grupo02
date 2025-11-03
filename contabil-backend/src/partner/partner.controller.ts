import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards } from '@nestjs/common';
import { PartnerService } from './partner.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { FilterPartnerDto } from './dto/filter-partner.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('partner')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Post()
  create(@Body() createPartnerDto: CreatePartnerDto) {
    return this.partnerService.create(createPartnerDto);
  }

  @Get()
  findAll(@Query() filterDto: FilterPartnerDto, @Req() req) {
    const user = req.user
    const companyId = user.companyId
    if (companyId && user.role.name !== 'ADMIN') {
      filterDto.companyId = companyId
    }
    return this.partnerService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    const user = req.user
    const companyId = user.companyId
    if (companyId && user.role.name !== 'ADMIN') {
      return this.partnerService.findOne(id, companyId);
    }
    return this.partnerService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePartnerDto: UpdatePartnerDto) {
    return this.partnerService.update(id, updatePartnerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const user = req.user
    const companyId = user.companyId
    if (companyId && user.role.name !== 'ADMIN') {
      return this.partnerService.remove(id, companyId);
    }
    return this.partnerService.remove(id);
  }

  @Patch(':id/inactivate')
  inactive(@Param('id') id: string) {
    return this.partnerService.inactivate(id);
  }
}
