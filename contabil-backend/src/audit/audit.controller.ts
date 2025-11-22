import { Controller, Get } from '@nestjs/common';
import { AuditService } from './audit.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Listar logs de auditoria' })
  findAll() {
    return this.auditService.findAll();
  }
}