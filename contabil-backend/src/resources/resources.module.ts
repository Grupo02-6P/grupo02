import { Module } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { ResourcesController } from './resources.controller';
import { UsersService } from 'src/users/users.service';

@Module({
  controllers: [ResourcesController],
  providers: [ResourcesService, UsersService],
})
export class ResourcesModule {}
