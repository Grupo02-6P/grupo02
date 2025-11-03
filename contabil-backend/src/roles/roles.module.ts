import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { UsersService } from 'src/users/users.service';

@Module({
  controllers: [RolesController],
  providers: [RolesService, UsersService],
})
export class RolesModule {}
