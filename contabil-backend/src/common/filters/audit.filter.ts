import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuditService } from '../../audit/audit.service';

@Catch(HttpException)
export class AuditExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AuditExceptionFilter.name);

  constructor(private auditService: AuditService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Captura apenas Acesso Negado (401/403)
    if (status === HttpStatus.UNAUTHORIZED || status === HttpStatus.FORBIDDEN) {
      const user = (request as any).user;
      
      // 1. Clonar o corpo da requisição e redigir dados sensíveis
      let newValuesData: any = request.body ? { ...request.body } : {};
      
      // 👇 CORREÇÃO DE SEGURANÇA: REMOVE A SENHA DO LOG
      if (request.url.includes('/auth/login') && newValuesData.password) {
          newValuesData.password = '[REDACTED]'; 
      }
      // FIM DA CORREÇÃO DE SEGURANÇA

      const userConnection = user?.userId ? { connect: { id: user.userId } } : undefined;

      this.auditService.create({
        action: status === 401 ? 'LOGIN_FAILED_OR_EXPIRED' : 'ACCESS_DENIED',
        entity: 'System',
        entityId: request.url,
        
        // oldValues agora contém dados sobre a origem
        oldValues: JSON.stringify({ method: request.method, ip: request.ip, userAgent: request.headers['user-agent'] }),
        
        // newValues contém o corpo da requisição (SEM SENHA)
        newValues: JSON.stringify(newValuesData), 
        
        user: userConnection, 
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers['user-agent'] || 'unknown',
      }).catch(err => this.logger.error(`Erro ao gravar auditoria: ${err.message}`));
    }

    // Devolve o erro original para o cliente
    response.status(status).json(exception.getResponse());
  }
}