import { Module } from '@nestjs/common';
import { TitleService } from './title.service';
import { TitleController } from './title.controller';
import { UsersModule } from '../users/users.module';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [UsersModule, CaslModule],
  controllers: [TitleController],
  providers: [TitleService],
})
export class TitleModule {}
