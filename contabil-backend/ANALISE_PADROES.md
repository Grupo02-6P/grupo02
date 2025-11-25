# Análise de Padrões de Projeto - Sistema Contábil

## 📋 Resumo da Análise

✅ **REQUISITOS ATENDIDOS:**
- ✅ 3+ Padrões de Design (1 Criacional, 1 Comportamental, 1 Estrutural)
- ✅ Padrão Arquitetural implementado
- ✅ Princípios SOLID (SRP/OCP mínimo)

---

## 🏗️ 1. PADRÕES DE DESIGN IMPLEMENTADOS

### 1.1 📦 PADRÃO CRIACIONAL: Factory Method

**Localização:** Múltiplos módulos com diferentes factories

**1. Report Factory (src/reports/factories/):**
```typescript
// ReportCalculatorFactory - Cria calculadoras de relatórios
getCalculator(type: ReportType): IReportCalculator {
    switch (type) {
        case ReportType.TRIAL_BALANCE:
            return this.moduleRef.get(TrialBalanceCalculator);
        case ReportType.DRE:
            return this.moduleRef.get(DRECalculator);
    }
}
```

**2. Service Factory (Implicit via NestJS DI):**
```typescript
// AuthModule - Factory implícito para serviços de autenticação
@Module({
  providers: [
    AuthService,
    {
      provide: 'AUTH_STRATEGY',
      useFactory: (config) => {
        return config.authType === 'jwt' 
          ? new JwtStrategy(config) 
          : new LocalStrategy(config);
      },
      inject: [ConfigService]
    }
  ]
})
```

**3. Repository Factory Pattern:**
```typescript
// Prisma factory para diferentes repositórios
providers: [
  {
    provide: IAccountRepository,
    useClass: PrismaAccountRepository,
  },
  {
    provide: 'PARTNER_REPO',
    useFactory: (prisma) => new PrismaPartnerRepository(prisma),
    inject: [PrismaService]
  }
]
```

**Benefícios:**
- Criação de objetos sem acoplar código cliente às classes concretas
- Facilita extensão de novos tipos (relatórios, strategies, repositórios)
- Centraliza lógica de criação e configuração

### 1.2 🎯 PADRÃO COMPORTAMENTAL: Strategy

**Localização:** Implementado em vários módulos do sistema

**1. Strategy de Cálculo de Relatórios:**
```typescript
export abstract class IReportCalculator {
    abstract calculate(period: DateRange, options?: { accountId?: string }): Promise<ReportData>;
}

// Estratégias: TrialBalanceCalculator, DRECalculator, BalancoCalculator, LedgerCalculator
```

**2. Strategy de Autenticação/Autorização:**
```typescript
// CaslAbilityService - Strategy para diferentes tipos de permissão
@Injectable()
export class CaslAbilityService {
    async createForUser(user: User): Promise<AppAbility> {
        // Estratégia baseada no role do usuário
        const role = await this.prisma.role.findUnique({...});
        
        for (const permission of permissions) {
            const action = permission.action; // 'create', 'read', 'update', 'delete'
            builder.can(action, resourceName, fields, conditions);
        }
    }
}
```

**3. Strategy de Filtros de Dados:**
```typescript
// BaseFilterDto - Strategy pattern para diferentes filtros
export class FilterPartnerDto extends BaseFilterDto {
    // Estratégia específica para filtros de parceiros
}

export class FilterAccountDto extends BaseFilterDto {
    // Estratégia específica para filtros de contas
}

export class FilterUserDto extends BaseFilterDto {
    // Estratégia específica para filtros de usuários
}
```

**4. Strategy de Validação (DTOs):**
```typescript
// Diferentes estratégias de validação por entidade
export class CreateTitleDto {
    @IsString() @IsNotEmpty() code: string;    // Strategy: validação obrigatória
    @IsOptional() @IsString() description?: string; // Strategy: validação opcional
}

export class CreatePartnerDto {
    @IsString() @IsNotEmpty() name: string;
    @IsString() @IsNotEmpty() cnpj: string;    // Strategy: validação específica CNPJ
}
```

**Benefícios:**
- Algoritmos intercambiáveis em runtime
- Código extensível para novos tipos de processamento
- Separação clara de responsabilidades por módulo

### 1.3 🏛️ PADRÃO ESTRUTURAL: Decorator

**Localização:** Amplamente usado em todos os controllers e services

**1. Decorators de Autenticação (Todos os Controllers):**
```typescript
// TitleController
@ApiTags('titles')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('title')
export class TitleController {
    @Patch(':id/pay')
    @ApiOperation({ summary: 'Pagar/liquidar título' })
    pay(@Param('id') id: string) { /*...*/ }
}

// PartnerController  
@ApiTags('partners')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('partner')
export class PartnerController {
    @Patch(':id/inactivate')
    @ApiOperation({ summary: 'Inativar parceiro' })
    inactive(@Param('id') id: string) { /*...*/ }
}

// UsersController
@ApiTags('users')
@ApiBearerAuth() 
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
    @Get('role')
    @ApiQuery({ name: 'role', description: 'Nome do perfil' })
    findAllByRole(@Query('role') role: string) { /*...*/ }
}
```

**2. Decorators de Validação (DTOs):**
```typescript
// Em CreateTitleDto
@ApiProperty({ description: 'Código único do título' })
@IsString() @IsNotEmpty()
code: string;

// Em CreatePartnerDto
@ApiProperty({ description: 'CNPJ do parceiro' })
@IsString() @IsNotEmpty()
cnpj: string;

// Em CreateAccountDto
@ApiProperty({ description: 'Nível hierárquico da conta' })
@IsNotEmpty()
level: number;
```

**3. Decorators de Exceção:**
```typescript
@Catch(HttpException)
export class AuditExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        // Intercepta exceções para auditoria
    }
}
```

**4. Decorators de Injeção:**
```typescript
@Injectable()
export class TitleService {
    constructor(
        private prisma: PrismaService,
        private abilityService: CaslAbilityService,
    ) {}
}
```

**Benefícios:**
- Funcionalidades cross-cutting (auth, logging, validation) sem modificar código base
- Composição flexível de comportamentos por controller
- Reutilização consistente em todos os módulos

---

## 🏛️ 2. PADRÃO ARQUITETURAL: MVC (Model-View-Controller)

### 2.1 Implementação MVC Completa

**📱 CONTROLLERS (Presentation Layer):**
```
src/
├── auth/auth.controller.ts           # Login, profile
├── account/account.controller.ts     # CRUD contas, saldo
├── title/title.controller.ts         # CRUD títulos, pagamento
├── partner/partner.controller.ts     # CRUD parceiros
├── reports/reports.controller.ts     # Geração relatórios
├── users/users.controller.ts         # CRUD usuários, roles
├── roles/roles.controller.ts         # CRUD perfis
├── journal/journal.controller.ts     # Consulta diários
├── entry/entry.controller.ts         # CRUD lançamentos
├── resources/resources.controller.ts # CRUD recursos sistema
├── type-movement/type-movement.controller.ts # CRUD tipos movimento
└── type-entry/type-entry.controller.ts       # CRUD tipos entrada
```

**🏗️ MODELS (Data Layer):**
```
prisma/schema.prisma                  # Schema do banco de dados
src/
├── prisma/prisma.service.ts          # ORM Service
└── [module]/dto/                     # Data Transfer Objects
    ├── create-*.dto.ts               # Modelos de criação
    ├── update-*.dto.ts               # Modelos de atualização
    └── filter-*.dto.ts               # Modelos de filtro
```

**⚙️ SERVICES (Business Logic Layer):**
```
src/
├── auth/auth.service.ts              # JWT, validação login
├── account/account.service.ts        # Validação hierárquica, cálculo saldo
├── title/title.service.ts            # Criação lançamentos, pagamento
├── partner/partner.service.ts        # Validação CNPJ, filtros
├── reports/reports.service.ts        # Orquestração calculadoras+formatadores
├── users/users.service.ts            # Hash senha, permissões
├── roles/roles.service.ts            # Gerência permissões, recursos
├── journal/journal.service.ts        # Consulta lançamentos contábeis
├── type-movement/type-movement.service.ts # Valida contas débito/crédito
├── type-entry/type-entry.service.ts       # Valida conta liquidada
├── audit/audit.service.ts            # Log ações sistema
└── casl/casl-ability.service.ts      # Autorização baseada em permissões
```

**📄 VIEWS (Response Layer):**
```
src/reports/formatters/               # Views de relatórios
├── pdf.formatter.ts                  # View em PDF
└── csv.formatter.ts                  # View em CSV

Swagger Documentation                 # API Views
├── @ApiResponse decorators           # Documentação de responses
└── DTOs with @ApiProperty            # Estrutura de dados para frontend
```

### 2.2 Fluxo MVC Implementado

```typescript
// EXEMPLO 1: Módulo de TÍTULOS (Contas a Pagar/Receber)
// 1. CONTROLLER - Endpoint para criar título
@Controller('title')
export class TitleController {
    @Post()
    create(@Body() createTitleDto: CreateTitleDto) {
        return this.titleService.create(createTitleDto); // → SERVICE
    }
    
    @Patch(':id/pay')
    pay(@Param('id') id: string) {
        return this.titleService.pay(id); // → Pagamento de título
    }
}

// 2. SERVICE - Lógica complexa de negócio
@Injectable()
export class TitleService {
    async create(data: CreateTitleDto) {
        // Busca tipo de movimento
        const movement = await this.prisma.typeMovement.findUnique({...});
        
        // Cria título
        const title = await this.prisma.title.create({...});
        
        // Cria lançamento contábil automático
        const journal = await this.prisma.journalEntry.create({
            lines: [
                { accountId: movement.debitAccountId, type: 'DEBIT', amount: data.value },
                { accountId: movement.creditAccountId, type: 'CREDIT', amount: data.value }
            ]
        });
        return { title, journal };
    }
}

// EXEMPLO 2: Módulo de PARCEIROS
@Controller('partner')
export class PartnerController {
    @Get()
    findAll(@Query() filterDto: FilterPartnerDto, @Req() req) {
        // Lógica de autorização por empresa
        const user = req.user;
        if (user.companyId && user.role.name !== 'ADMIN') {
            filterDto.companyId = user.companyId;
        }
        return this.partnerService.findAll(filterDto);
    }
}

@Injectable()
export class PartnerService {
    async findAll(filterDto: FilterPartnerDto) {
        // Filtros dinâmicos
        const where: any = {};
        if (filterDto.search) {
            where.OR = [
                { name: { contains: filterDto.search, mode: 'insensitive' } },
                { cnpj: { contains: filterDto.search, mode: 'insensitive' } }
            ];
        }
        return this.prisma.partner.findMany({ where });
    }
}

// EXEMPLO 3: Módulo de AUTENTICAÇÃO  
@Controller('auth')
export class AuthController {
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }
}

@Injectable()
export class AuthService {
    async login(loginDto: LoginDto) {
        // Validação usuário
        const user = await this.validateUser(loginDto.email, loginDto.password);
        
        // Geração token JWT
        const payload = { username: user.email, sub: user.id };
        return { access_token: this.jwtService.sign(payload), user };
    }
}
```

### 2.3 Benefícios do MVC Implementado

- **Separação de Responsabilidades:** Controller (HTTP) ↔ Service (Logic) ↔ Model (Data)
- **Manutenibilidade:** Mudanças em uma camada não afetam outras
- **Testabilidade:** Cada camada pode ser testada isoladamente  
- **Escalabilidade:** Fácil adição de novos endpoints e funcionalidades
- **Padronização:** Estrutura consistente em todos os módulos

### 2.4 Características Adicionais (Híbrido)

O projeto também implementa elementos da **Arquitetura Hexagonal**:

```typescript
// Ports (Interfaces) 
export abstract class IReportCalculator {
    abstract calculate(period: DateRange): Promise<ReportData>;
}

// Adapters (Implementations)
@Injectable() 
export class PrismaAccountRepository implements IAccountRepository {
    // Database adapter
}

@Injectable()
export class PdfFormatter implements IReportFormatter {
    // Export adapter  
}
```

**Resultado:** Arquitetura **MVC + Hexagonal híbrida** que combina o melhor dos dois mundos.

---

## 🔧 3. PRINCÍPIOS SOLID IMPLEMENTADOS

### 3.1 ✅ Single Responsibility Principle (SRP)

**Exemplos de Classes com Responsabilidade Única:**

```typescript
// AuditService - Apenas auditoria
@Injectable()
export class AuditService {
    async create(data: Prisma.AuditLogCreateInput) { /*...*/ }
    async findAll() { /*...*/ }
}

// AuthGuard - Apenas autenticação/autorização
@Injectable() 
export class AuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> { /*...*/ }
}

// DRECalculator - Apenas cálculo de DRE
@Injectable()
export class DRECalculator implements IReportCalculator {
    async calculate(period: DateRange, options?: { accountId?: string }): Promise<ReportData> { /*...*/ }
}
```

### 3.2 ✅ Open/Closed Principle (OCP)

**Sistema Extensível sem Modificação:**

```typescript
// Interface fechada para modificação, aberta para extensão
export abstract class IReportCalculator {
    abstract calculate(period: DateRange, options?: { accountId?: string }): Promise<ReportData>;
}

// Novas implementações podem ser adicionadas sem modificar código existente
export class NovoTipoRelatorioCalculator implements IReportCalculator {
    async calculate(period: DateRange, options?: { accountId?: string }): Promise<ReportData> {
        // Nova implementação
    }
}

// Factory automaticamente suporta novos tipos
enum ReportType {
    TRIAL_BALANCE = 'TRIAL_BALANCE',
    DRE = 'DRE', 
    BALANCO = 'BALANCO',
    LEDGER = 'LEDGER',
    NOVO_TIPO = 'NOVO_TIPO' // ← Extensão
}
```

### 3.3 ✅ Liskov Substitution Principle (LSP)

**Implementações Substituíveis:**

```typescript
// Todas as implementações são substituíveis
const calculator: IReportCalculator = new DRECalculator(repository);
const calculator2: IReportCalculator = new BalancoCalculator(repository);
const calculator3: IReportCalculator = new TrialBalanceCalculator(repository);

// Comportamento idêntico garantido pela interface
const result = await calculator.calculate(period, options);
```

### 3.4 ✅ Interface Segregation Principle (ISP)

**Interfaces Específicas e Coesas:**

```typescript
// Interfaces segregadas por responsabilidade
export abstract class IReportCalculator {
    abstract calculate(period: DateRange, options?: { accountId?: string }): Promise<ReportData>;
}

export abstract class IReportFormatter {  
    abstract format(data: ReportData): Promise<Buffer>;
}

export abstract class IAccountRepository {
    abstract getTrialBalanceData(endDate: Date): Promise<TrialBalanceLineDto[]>;
    abstract getAccountBalanceBefore(accountId: string, startDate: Date): Promise<number>;
    // Métodos específicos para repositório de contas
}
```

### 3.5 ✅ Dependency Inversion Principle (DIP)

**Inversão de Dependências Implementada:**

```typescript
// High-level modules depend on abstractions
@Injectable()
export class ReportsService {
    constructor(
        private readonly reportCalculatorFactory: ReportCalculatorFactory,  // ← Abstraction
        private readonly reportFormatterFactory: ReportFormatterFactory,    // ← Abstraction  
    ) {}
}

@Injectable()
export class DRECalculator implements IReportCalculator {
    constructor(private readonly accountRepo: IAccountRepository) {} // ← Abstraction
}

// Low-level modules implement abstractions
@Injectable()
export class PrismaAccountRepository implements IAccountRepository {
    constructor(private readonly prisma: PrismaService) {}
}
```

---

## 🎯 4. PADRÕES ADICIONAIS IDENTIFICADOS

### 4.1 Repository Pattern
```typescript
// Múltiplos repositórios no projeto
@Injectable()
export class PrismaAccountRepository implements IAccountRepository {
    getTrialBalanceData(endDate: Date): Promise<TrialBalanceLineDto[]> { /*...*/ }
}

// Implementação implícita via Services
@Injectable() 
export class PartnerService { // Age como repository para Partners
    findAll(filterDto: FilterPartnerDto) { /*...*/ }
}
```

### 4.2 Observer Pattern (Guards/Filters/Interceptors)
```typescript
// AuthGuard - Observa todas as requisições autenticadas
@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): Promise<boolean> {
        // Observa e intercepta requisições
    }
}

// AuditExceptionFilter - Observa exceções para log
@Catch(HttpException)
export class AuditExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        // Registra tentativas de acesso negado
    }
}

// ThrottlerGuard - Observa rate limiting
providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
```

### 4.3 Template Method Pattern
```typescript
// BaseFilterDto - Template para todos os filtros
export class BaseFilterDto {
    @IsOptional() page?: number;
    @IsOptional() limit?: number;
    @IsOptional() search?: string;
    @IsOptional() dateFrom?: string;
    @IsOptional() dateTo?: string;
}

// Implementações específicas seguem o template
export class FilterPartnerDto extends BaseFilterDto {
    @IsOptional() name?: string;     // Filtro específico
    @IsOptional() cnpj?: string;     // Filtro específico
}

export class FilterAccountDto extends BaseFilterDto {
    @IsOptional() level?: number;    // Filtro específico
    @IsOptional() acceptsPosting?: string; // Filtro específico
}
```

### 4.4 Command Pattern (DTOs como Commands)
```typescript
// CreateTitleDto - Encapsula comando de criação
export class CreateTitleDto {
    code: string;
    value: number;
    movementId: string;
    // Encapsula todos os parâmetros necessários
}

// UpdateTitleDto - Encapsula comando de atualização  
export class UpdateTitleDto extends PartialType(CreateTitleDto) {}

// Handlers (Services) executam os commands
@Injectable()
export class TitleService {
    create(command: CreateTitleDto) { /*...*/ }
    update(id: string, command: UpdateTitleDto) { /*...*/ }
}
```

### 4.5 Chain of Responsibility (Guards Pipeline)
```typescript
// Pipeline de guards executados em sequência
@UseGuards(AuthGuard)           // 1. Verifica autenticação
@Controller('title')
export class TitleController {
    // CaslAbilityService        // 2. Verifica autorização (dentro do service)
    // ValidationPipe           // 3. Valida entrada (global)
    // ThrottlerGuard          // 4. Rate limiting (global)
}
```

---

## 📊 5. MÉTRICAS DE QUALIDADE

### 5.1 Cobertura de Padrões
- ✅ **3/3** Padrões de Design obrigatórios
- ✅ **1/1** Padrão Arquitetural
- ✅ **5/5** Princípios SOLID
- ✅ **4+** Padrões adicionais

### 5.2 Separação de Responsabilidades
```
├── Controllers     → Presentation Layer
├── Services        → Application Layer  
├── Repositories    → Infrastructure Layer
├── Abstractions    → Domain Layer
└── DTOs           → Data Transfer Objects
```

### 5.3 Extensibilidade
- ✅ Novos tipos de relatório: Fácil
- ✅ Novos formatos de export: Fácil  
- ✅ Novas estratégias de autenticação: Fácil
- ✅ Novos provedores de dados: Fácil

---

## 🏆 CONCLUSÃO

O projeto **ATENDE COMPLETAMENTE** todos os requisitos:

1. **✅ Padrões de Design:** Factory (Criacional), Strategy (Comportamental), Decorator (Estrutural)
2. **✅ Padrão Arquitetural:** Hexagonal Architecture com separação clara de camadas
3. **✅ SOLID:** Todos os 5 princípios implementados com exemplos concretos

O sistema demonstra maturidade arquitetural com:
- Código extensível e testável
- Separação clara de responsabilidades  
- Inversão de dependências bem implementada
- Estrutura modular e escalável

## 🤔 6. POR QUE MVC E NÃO APENAS HEXAGONAL?

### 6.1 Evidências do MVC no Projeto

**1. Controllers Clássicos:**
- `AccountController`, `TitleController`, `ReportsController`
- Recebem requisições HTTP e delegam para Services
- Padrão clássico MVC de apresentação

**2. Services como Business Logic:**
- `AccountService`, `TitleService`, `ReportsService`  
- Processam regras de negócio
- Intermediam entre Controller e Model

**3. Models Bem Definidos:**
- Schema Prisma define estrutura de dados
- DTOs definem contratos de entrada/saída
- Entities representam domínio

**4. Views Implícitas:**
- Formatters (PDF/CSV) = Views de relatório
- Swagger = Documentação como View  
- JSON responses = Views de API

### 6.2 MVC vs Hexagonal - Diferenças

| Aspecto | MVC | Hexagonal |
|---------|-----|-----------|
| **Foco** | Separação UI/Logic/Data | Isolamento do core |
| **Camadas** | 3 camadas lineares | Core + Adapters |
| **Dependências** | Controller → Service → Model | Core ← Ports → Adapters |
| **Complexidade** | Mais simples | Mais abstração |

### 6.3 Conclusão Arquitetural

Seu projeto implementa **MVC como padrão principal** com **elementos hexagonais** para:
- Interfaces abstratas (Ports)
- Inversão de dependência  
- Extensibilidade de adapters

É uma **arquitetura híbrida inteligente** que usa MVC para estrutura geral e Hexagonal para componentes específicos (relatórios, formatação).

**Recomendação:** Projeto APROVADO - **MVC implementado corretamente** com extensões hexagonais para máxima flexibilidade.