import { Module } from '@nestjs/common';
import { TypeEntryService } from './type-entry.service';
import { TypeEntryController } from './type-entry.controller';
import { UsersService } from 'src/users/users.service';

@Module({
  controllers: [TypeEntryController],
  providers: [TypeEntryService, UsersService],
})
export class TypeEntryModule {}
