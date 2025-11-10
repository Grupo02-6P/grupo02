import { Module } from '@nestjs/common';
import { TittleService } from './tittle.service';
import { TittleController } from './tittle.controller';

@Module({
  controllers: [TittleController],
  providers: [TittleService],
})
export class TittleModule {}
