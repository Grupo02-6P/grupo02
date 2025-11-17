import { Module } from '@nestjs/common';
import { TypeMovementService } from './type-movement.service';
import { TypeMovementController } from './type-movement.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [TypeMovementController],
  providers: [TypeMovementService],
})
export class TypeMovementModule {}
