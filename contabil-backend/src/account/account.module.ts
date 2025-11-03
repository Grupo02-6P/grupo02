import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { UsersService } from 'src/users/users.service';

@Module({
  controllers: [AccountController],
  providers: [AccountService, UsersService],
})
export class AccountModule {}
