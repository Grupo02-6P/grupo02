import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CaslModule } from './casl/casl.module';
import { RolesModule } from './roles/roles.module';
import { ResourcesModule } from './resources/resources.module';
import { PartnerModule } from './partner/partner.module';
import { AccountModule } from './account/account.module';
import { TypeMovementModule } from './type-movement/type-movement.module';
import { TypeEntryModule } from './type-entry/type-entry.module';
import { TitleModule } from './title/title.module';
import { EntryModule } from './entry/entry.module';
import { JournalModule } from './journal/journal.module';
import { ReportsModule } from './reports/reports.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    AuthModule,
    CaslModule,
    RolesModule,
    ResourcesModule,
    PartnerModule,
    AccountModule,
    TypeMovementModule,
    TypeEntryModule,
    TitleModule,
    EntryModule,
    JournalModule,
    ReportsModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
