import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuditService } from './audit/audit.service';
import { AuditExceptionFilter } from './common/filters/audit.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors({
    origin: true, // Para desenvolvimento - aceita qualquer origem
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Contábil API')
    .setDescription('API para sistema contábil com gestão de contas, lançamentos e relatórios')
    .setVersion('1.0')
    .addTag('auth', 'Autenticação e autorização')
    .addTag('accounts', 'Gestão de contas contábeis')
    .addTag('entries', 'Lançamentos contábeis')
    .addTag('journals', 'Diários de lançamentos')
    .addTag('partners', 'Parceiros (clientes/fornecedores)')
    .addTag('reports', 'Relatórios contábeis')
    .addTag('titles', 'Títulos a pagar/receber')
    .addTag('users', 'Gestão de usuários')
    .addTag('roles', 'Perfis e permissões')
    .addTag('resources', 'Recursos do sistema')
    .addTag('type-movements', 'Tipos de movimento')
    .addTag('type-entries', 'Tipos de entrada')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);

  const auditService = app.get(AuditService);
  app.useGlobalFilters(new AuditExceptionFilter(auditService));
}
bootstrap();
