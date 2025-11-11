# 📘 Funcionamento dos Lançamentos Contábeis — Títulos e Entradas

Este documento explica, com base no schema Prisma, como funcionam os **lançamentos automáticos** de **Títulos (Tittle)** e **Entradas (Entry)** dentro do sistema de **contabilidade de dupla entrada**.

---

## 🧾 1. Conceito Geral

O sistema implementa o **método das partidas dobradas (dupla entrada)**:

> 🔹 **Para cada lançamento contábil (JournalEntry), há sempre pelo menos duas linhas (JournalLine):**
> - Uma **débito**
> - Uma **crédito**
>  
> O total de débitos **deve sempre ser igual** ao total de créditos.

Cada evento financeiro (um título ou uma entrada) **gera automaticamente** seus lançamentos contábeis no livro razão.

---

## 🧱 2. Lançamento de Título (`Tittle`)

### 📄 O que é um Título

Um **Tittle** representa o **lançamento principal** de uma operação financeira, como:
- Venda de mercadoria
- Compra de insumos
- Despesa com energia
- Receita de serviço

Cada título está vinculado a um **tipo de movimento (`typeMovement`)**, que define **quais contas contábeis** serão debitadas e creditadas.

---

### ⚙️ Estrutura relevante

model Tittle {
  id          String   @id @default(uuid())
  code        String   @unique
  description String?
  value       Float
  movementId  String
  movement    typeMovement @relation(fields: [movementId], references: [id])
  journalEntries JournalEntry[]
}

model typeMovement {
  id              String    @id @default(uuid())
  name            String    @unique
  creditAccountId String
  debitAccountId  String
  creditAccount   Account   @relation("CreditAccount", fields: [creditAccountId], references: [id])
  debitAccount    Account   @relation("DebitAccount", fields: [debitAccountId], references: [id])
}

---

### 🔄 Fluxo ao criar um Título

1. O usuário cadastra um novo **Título**, informando:
   - Valor (ex: `2500`)
   - Tipo de movimento (`typeMovement`)
   - Parceiro (`Partner`, opcional)

2. O sistema **gera automaticamente** um **JournalEntry** vinculado ao título.

3. Dentro desse `JournalEntry`, são criadas **duas JournalLines**:
   - **Débito** → na conta `debitAccountId` do `typeMovement`
   - **Crédito** → na conta `creditAccountId` do `typeMovement`

---

### 🧩 Exemplo prático

| Campo | Valor |
|-------|--------|
| Título | Conta de luz |
| Valor | R$ 2.500 |
| Tipo de movimento | Despesa de energia |
| Conta débito | Despesa de Energia (ex: 3.1.1) |
| Conta crédito | Fornecedores (ex: 2.1.2) |

**Journal gerado automaticamente:**

| Conta | Tipo | Valor |
|--------|-------|--------|
| Despesa de Energia | **DEBIT** | 2.500 |
| Fornecedores | **CREDIT** | 2.500 |

📘 Resultado:
- O sistema registrou que a empresa **teve uma despesa (débito)** e **criou uma obrigação (crédito)**.

---

## 💰 3. Lançamento de Entrada (`Entry`)

### 📄 O que é uma Entrada

Uma **Entry** representa a **baixa (liquidação)** de um título.  
Exemplo: pagamento de um fornecedor ou recebimento de um cliente.

Cada entrada está associada a um:
- **Título (`tittleId`)**
- **Tipo de entrada (`typeEntry`)**, que define a **conta de compensação (baixa)**.

---

### ⚙️ Estrutura relevante

model Entry {
  id           String     @id @default(uuid())
  code         String     @unique
  value        Float
  tittleId     String
  entryTypeId  String
  tittle       Tittle     @relation(fields: [tittleId], references: [id])
  entryType    typeEntry  @relation(fields: [entryTypeId], references: [id])
  journalEntries JournalEntry[]
}

model typeEntry {
  id              String     @id @default(uuid())
  name            String
  accountClearedId String
  accountCleared   Account   @relation("ClearedAccount", fields: [accountClearedId], references: [id])
}

---

### 🔄 Fluxo ao criar uma Entrada

1. O usuário cadastra uma **Entrada** vinculando a um **Título**.
2. O sistema busca:
   - A conta de **baixa** (`accountClearedId`) do `typeEntry`
   - As contas do movimento do título (para saber qual conta será compensada)
3. O sistema gera um novo **JournalEntry** com duas **JournalLines**:
   - **Débito** → conta de baixa (`accountClearedId`)
   - **Crédito** → conta debitada originalmente pelo título (`movement.debitAccountId`)

---

### 🧩 Exemplo prático

| Campo | Valor |
|-------|--------|
| Entrada | Pagamento da conta de luz |
| Valor | R$ 2.500 |
| Tipo de entrada | Pagamento em dinheiro |
| Conta de baixa | Caixa (1.1.1) |
| Conta do título | Despesa de Energia (3.1.1) |

**Journal gerado automaticamente:**

| Conta | Tipo | Valor |
|--------|-------|--------|
| Caixa | **DEBIT** | 2.500 |
| Despesa de Energia | **CREDIT** | 2.500 |

📘 Resultado:
- O sistema registrou que a empresa **pagou** a conta (saída de caixa) e **baixou a despesa** correspondente.

---

## 📚 4. Lançamentos Contábeis (`JournalEntry` e `JournalLine`)

Cada operação (título ou entrada) gera um **`JournalEntry`** — o registro contábil.

model JournalEntry {
  id          String      @id @default(uuid())
  date        DateTime    @default(now())
  originType  JournalOrigin? // TITTLE ou ENTRY
  tittleId    String?
  entryId     String?
  lines       JournalLine[]
}

As **linhas (`JournalLine`)** detalham as contas envolvidas:

model JournalLine {
  id             String       @id @default(uuid())
  journalEntryId String
  accountId      String
  type           LineType     // DEBIT ou CREDIT
  amount         Float
}

---

## 💹 5. Cálculo de Saldos das Contas

Cada conta (`Account`) acumula lançamentos de débito e crédito a partir das `JournalLine`.

**Saldo da conta = (Débitos) - (Créditos)**

### Exemplo

| Conta | Débito | Crédito | Saldo |
|--------|--------|----------|--------|
| Caixa | 2.500 | 0 | +2.500 |
| Despesa de Energia | 2.500 | 2.500 | 0 |
| Fornecedores | 0 | 2.500 | -2.500 |

---

## 🔁 6. Ciclo completo de exemplo

| Etapa | Operação | Conta Débito | Conta Crédito | Valor | Origem |
|-------|-----------|---------------|----------------|--------|----------|
| 1 | Lançamento de Título | Despesa de Energia | Fornecedores | 2.500 | TITTLE |
| 2 | Lançamento de Entrada | Fornecedores | Caixa | 2.500 | ENTRY |

📊 **Saldos finais:**
- **Caixa:** -2.500  
- **Despesa de Energia:** +2.500  
- **Fornecedores:** 0 (dívida quitada)

---

## 🧠 7. Resumo

| Entidade | Papel | Gera lançamento contábil? | Impacto |
|-----------|--------|----------------------------|----------|
| **Tittle** | Lançamento principal (compra/venda/despesa) | ✅ Sim | Cria lançamento de origem `TITTLE` |
| **Entry** | Baixa ou liquidação do título | ✅ Sim | Cria lançamento de origem `ENTRY` |
| **JournalEntry** | Registro contábil (livro razão) | ✅ Sim | Agrupa as linhas contábeis |
| **JournalLine** | Linha do lançamento (conta + tipo + valor) | ✅ Sim | Atualiza saldo da conta |
| **Account** | Conta contábil | ❌ | Recebe impacto via `JournalLine` |

---

## 📘 Conclusão

O sistema garante:
- **Integridade contábil total** (tudo tem débito e crédito)
- **Rastreabilidade de origem** (título e entrada)
- **Automação de lançamentos** (nada manual)
- **Cálculo preciso de saldos** via `JournalLine`

Cada operação financeira cria automaticamente sua contrapartida, garantindo uma **contabilidade de dupla entrada correta e auditável**.
