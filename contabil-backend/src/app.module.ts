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
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';


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
    ThrottlerModule.forRoot({
      ttl: 60,   // Tempo em segundos
      limit: 10, // Limite de requisições por TTL para cada IP
    }),
    PrometheusModule.register(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
