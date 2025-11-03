import { Module } from '@nestjs/common';
import { TypeMovementService } from './type-movement.service';
import { TypeMovementController } from './type-movement.controller';
import { UsersService } from 'src/users/users.service';

@Module({
  controllers: [TypeMovementController],
  providers: [TypeMovementService, UsersService],
})
export class TypeMovementModule {}
