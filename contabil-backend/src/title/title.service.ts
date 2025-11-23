import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTitleDto } from './dto/create-title.dto';
import { UpdateTitleDto } from './dto/update-title.dto';
import { CaslAbilityService } from 'src/casl/casl-ability/casl-ability.service';
import { BaseFilterDto } from 'src/common/dto/base-filter.dto';
import { PaginatedResponse } from 'src/common/interfaces/pagination.interface';
import { Prisma } from '@prisma/client';
import { ReverseTitleDto } from './dto/reverse-title.dto';
import { AuditService } from '../audit/audit.service';
import { differenceInDays } from 'date-fns';
import { JournalOrigin, LineType } from '@prisma/client';

@Injectable()
export class TitleService {
  constructor(
    private prisma: PrismaService,
    private abilityService: CaslAbilityService,
    private auditService: AuditService,
  ) {}

  async create(data: CreateTitleDto) {
    const ability = this.abilityService.ability;

    if (!ability.can('create', 'Title')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    const movement = await this.prisma.typeMovement.findUnique({
      where: { id: data.movementId },
      include: {
        debitAccount: true,
        creditAccount: true,
      },
    });

    if (!movement) {
      throw new NotFoundException('Tipo de movimento não encontrado');
    }

    try {
      //Cria o título
      const title = await this.prisma.title.create({
        data: {
          code: data.code,
          description: data.description,
          date: data.date ? new Date(data.date) : new Date(),
          value: data.value,
          status: data.status ?? 'ACTIVE',
          partnerId: data.partnerId,
          movementId: data.movementId,
          typeEntryId: data.typeEntryId,
        },
      });

      // 📘 Cria o lançamento contábil (JournalEntry + Lines)
      const journal = await this.prisma.journalEntry.create({
        data: {
          titleId: title.id,
          originType: 'TITLE',
          originId: title.id,
          lines: {
            create: [
              {
                accountId: movement.debitAccountId,
                type: 'DEBIT',
                amount: data.value,
              },
              {
                accountId: movement.creditAccountId,
                type: 'CREDIT',
                amount: data.value,
              },
            ],
          },
        },
        include: {
          lines: { include: { account: true } },
        },
      });

      return { ...title, journal };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Já existe um título com este código');
        }
      }
      throw error;
    }
  }

  async findAll(filterDto: BaseFilterDto): Promise<PaginatedResponse<any>> {
    const ability = this.abilityService.ability;

    if (!ability.can('read', 'Title')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      dateFrom,
      dateTo,
    } = filterDto;

    // Se limit for -1, buscar todos os registros
    const getAllRecords = limit === -1;
    const skip = getAllRecords ? 0 : (page - 1) * limit;
    const take = getAllRecords ? undefined : limit;

    const where: any = {};

    // Filtro de busca geral
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtros específicos
    if (status) {
      where.status = status;
    }

    // Filtros de data
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        where.date.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo);
      }
    }

    // Executar consultas em paralelo
    const [data, total] = await Promise.all([
      this.prisma.title.findMany({
        where,
        skip,
        ...(take !== undefined && { take }),
        include: {
          movement: true,
          partner: true,
          typeEntry: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.title.count({ where }),
    ]);

    // Se estiver buscando todos os registros, ajustar metadados de paginação
    if (getAllRecords) {
      return {
        data,
        pagination: {
          page: 1,
          limit: total,
          total,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const ability = this.abilityService.ability;

    if (!ability.can('read', 'Title')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    return this.prisma.title.findUnique({
      where: { id },
      include: {
        movement: true,
        partner: true,
        typeEntry: true,
        journalEntries: {
          include: { lines: { include: { account: true } } },
        },
      },
    });
  }

  async update(id: string, data: UpdateTitleDto) {
    const ability = this.abilityService.ability;

    if (!ability.can('update', 'Title')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    // Verificar se o título existe
    const title = await this.prisma.title.findUnique({
      where: { id },
    });

    if (!title) {
      throw new NotFoundException('Título não encontrado');
    }

    if( title.status === 'PAID') {
      throw new ConflictException('Títulos pagos não podem ser inativados');
    }

    try {
      return this.prisma.title.update({
        where: { id },
        data: {
          ...data,
          date: data.date ? new Date(data.date) : undefined,
        },
        include: { movement: true, partner: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Já existe um título com este código');
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    const ability = this.abilityService.ability;

    if (!ability.can('delete', 'Title')) {
      throw new UnauthorizedException('Ação não permitida');
    }
    // Verificar se o título existe
    const title = await this.prisma.title.findUnique({
      where: { id },
    });

    if (!title) {
      throw new NotFoundException('Título não encontrado');
    }
    if( title.status === 'PAID') {
      throw new ConflictException('Títulos pagos não podem ser inativados');
    }

    return this.prisma.title.delete({ where: { id } });
  }

  async inactivate(id: string) {
    const ability = this.abilityService.ability;

    if (!ability.can('delete', 'Title')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    // Verificar se o título existe
    const title = await this.prisma.title.findUnique({
      where: { id },
    });

    if (!title) {
      throw new NotFoundException('Título não encontrado');
    }

    if( title.status === 'PAID') {
      throw new ConflictException('Títulos pagos não podem ser inativados');
    }

    return this.prisma.title.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }

  async pay(id: string) {
    const ability = this.abilityService.ability;

    if (!ability.can('update', 'Title')) {
      throw new UnauthorizedException('Ação não permitida');
    }

    // Verificar se o título existe
    const title = await this.prisma.title.findUnique({
      where: { id },
      include: {
        movement: true,
        typeEntry: true,
      },
    });

    if (!title) {
      throw new NotFoundException('Título não encontrado');
    }

    const debitAccountId = title.movement.creditAccountId;
    const creditAccountId = title.typeEntry?.accountClearedId;

    if (!debitAccountId || !creditAccountId) {
      throw new ConflictException(
        'Contas contábeis para baixa não estão configuradas corretamente',
      );
    }

    // 📘 Cria o lançamento contábil (JournalEntry + Lines)
      const journal = await this.prisma.journalEntry.create({
        data: {
          titleId: title.id,
          originType: 'TITLE',
          originId: title.id,
          lines: {
            create: [
              {
                accountId: debitAccountId,
                type: 'DEBIT',
                amount: title.value,
              },
              {
                accountId: creditAccountId,
                type: 'CREDIT',
                amount: title.value,
              },
            ],
          },
        },
        include: {
          lines: { include: { account: true } },
        },
      });

    return this.prisma.title.update({
      where: { id },
      data: { status: 'PAID', paidAt: new Date() },
    });
  }

  async reversePayment(id: string, reverseDto: ReverseTitleDto, currentUser: any) {
    // 1. Buscar o título com as configurações de contas (movement e typeEntry)
    const title = await this.prisma.title.findUnique({
      where: { id },
      include: { 
        movement: true, 
        typeEntry: true 
      }
    });

    if (!title) throw new NotFoundException('Título não encontrado.');
    
    // 2. Validações
    if (title.status !== 'PAID') {
      throw new BadRequestException('Apenas títulos PAGOS podem ser estornados.');
    }

    if (!title.paidAt) {
      throw new BadRequestException('Data de pagamento não encontrada.'); // Segurança extra
    }

    // Validação de prazo (7 dias)
    const daysSincePayment = differenceInDays(new Date(), new Date(title.paidAt));
    if (daysSincePayment > 7) {
      throw new BadRequestException('Prazo de estorno expirado (limite de 7 dias).');
    }

    // 3. Identificar as contas para reverter (Lógica Inversa ao método Pay)
    // No Pay: Debitou 'movement.creditAccountId' e Creditou 'typeEntry.accountClearedId'
    // No Estorno: Vamos inverter.
    
    const debitAccountReversal = title.typeEntry?.accountClearedId;
    const creditAccountReversal = title.movement.creditAccountId;

    if (!debitAccountReversal || !creditAccountReversal) {
       // Se faltar conta, não dá pra fazer o lançamento contábil reverso
       throw new ConflictException('Configuração de contas inconsistente para realizar o estorno.');
    }

    // 4. Transação Atômica
    await this.prisma.$transaction(async (tx) => {
      
      // A. Criar o Lançamento de Reversão
      await tx.journalEntry.create({
        data: {
          date: new Date(),
          originType: JournalOrigin.REVERSAL, // Enum novo para identificar estorno
          originId: title.id,
          titleId: title.id,
          lines: {
            create: [
              {
                // Onde entrou dinheiro (Crédito original), agora sai (Débito)
                accountId: debitAccountReversal, 
                type: 'DEBIT',
                amount: title.value
              },
              {
                // Onde saiu dinheiro (Débito original), agora volta (Crédito)
                accountId: creditAccountReversal, 
                type: 'CREDIT',
                amount: title.value
              }
            ]
          }
        }
      });

      // B. Voltar o título para EM ABERTO
      await tx.title.update({
        where: { id },
        data: { 
          status: 'ACTIVE',
          paidAt: null
        }
      });
    });

    // 5. Auditoria
    this.auditService.create({
      action: 'REVERSE_PAYMENT',
      entity: 'Title',
      entityId: id,
      oldValues: { status: 'PAID', paidAt: title.paidAt },
      newValues: { status: 'ACTIVE', paidAt: null, reason: reverseDto.justification },
      user: { connect: { id: currentUser.id } },
      ipAddress: 'N/A',
      userAgent: 'N/A'
    }).catch(console.error);

    return { message: 'Estorno realizado com sucesso.' };
  }
}
