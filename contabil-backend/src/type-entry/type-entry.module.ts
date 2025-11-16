import { Module } from '@nestjs/common';
import { TypeEntryService } from './type-entry.service';
import { TypeEntryController } from './type-entry.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [TypeEntryController],
  providers: [TypeEntryService],
})
export class TypeEntryModule {}
