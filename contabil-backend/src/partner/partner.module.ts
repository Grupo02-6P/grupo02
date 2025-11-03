import { Module } from '@nestjs/common';
import { PartnerService } from './partner.service';
import { PartnerController } from './partner.controller';
import { UsersService } from 'src/users/users.service';

@Module({
  controllers: [PartnerController],
  providers: [PartnerService, UsersService],
})
export class PartnerModule {}
