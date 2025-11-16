# 📘 API de Lançamentos Contábeis — Títulos e Entradas

Este documento descreve os **endpoints REST** disponíveis para gerenciar **Títulos (Titles)** e **Entradas (Entries)**.

Cada lançamento gera automaticamente um **JournalEntry**, que representa o lançamento contábil de dupla entrada (débito e crédito).

---

## ⚙️ BASE URL

http://localhost:3000

---

# 🧾 TÍTULOS (`/titles`)

## 1️⃣ Criar um novo Título
### ➤ POST /titles

Cria um **Título** (lançamento principal) e **gera automaticamente o JournalEntry**.

### Exemplo de corpo (JSON)

{
  "code": "VENDA-0001",
  "description": "Conta de luz - novembro",
  "date": "2025-11-10T10:30:00.000Z",
  "value": 2500,
  "status": "ACTIVE",
  "movementId": "{{id_do_tipo_de_movimento}}",
  "partnerId": "{{id_do_parceiro}}"
}

---

## 2️⃣ Listar todos os Títulos
### ➤ GET /titles

Retorna todos os títulos com seus movimentos, parceiros e lançamentos contábeis.

---

## 3️⃣ Buscar Título por ID
### ➤ GET /titles/:id

Exemplo:
GET /titles/{{id_do_titulo}}

---

## 4️⃣ Atualizar um Título
### ➤ PATCH /titles/:id

Exemplo de corpo:
{
  "description": "Conta de luz - novembro atualizada",
  "value": 2600
}

---

## 5️⃣ Remover um Título
### ➤ DELETE /titles/:id

Exemplo:
DELETE /titles/{{id_do_titulo}}

---

# 💰 ENTRADAS (`/entries`)

As **Entradas** representam **baixas (liquidações)** de títulos.

Cada entrada gera automaticamente um **JournalEntry de origem ENTRY**, que faz o débito na conta de baixa e crédito na conta do título.

---

## 1️⃣ Criar uma nova Entrada
### ➤ POST /entries

Exemplo de corpo (JSON):

{
  "code": "ENTRADA-0001",
  "description": "Pagamento da conta de luz",
  "date": "2025-11-11T08:00:00.000Z",
  "value": 2500,
  "status": "ACTIVE",
  "titleId": "{{id_do_titulo}}",
  "entryTypeId": "{{id_do_tipo_de_entrada}}"
}

---

## 2️⃣ Listar todas as Entradas
### ➤ GET /entries

Retorna todas as entradas com o tipo de entrada e título associado.

---

## 3️⃣ Buscar Entrada por ID
### ➤ GET /entries/:id

Exemplo:
GET /entries/{{id_da_entrada}}

---

## 4️⃣ Atualizar uma Entrada
### ➤ PATCH /entries/:id

Exemplo de corpo:
{
  "description": "Pagamento ajustado",
  "value": 2550
}

---

## 5️⃣ Remover uma Entrada
### ➤ DELETE /entries/:id

Exemplo:
DELETE /entries/{{id_da_entrada}}

---

# 📊 Exemplo completo do ciclo contábil

| Etapa | Operação | Conta Débito | Conta Crédito | Valor | Origem |
|-------|-----------|---------------|----------------|--------|----------|
| 1 | Criação do Título | Despesa de Energia | Fornecedores | 2.500 | TITLE |
| 2 | Criação da Entrada | Caixa | Despesa de Energia | 2.500 | ENTRY |

📈 Resultado:
- Caixa: -2.500  
- Despesa de Energia: +2.500 - 2.500 = 0  
- Fornecedores: 0 (quitado)

---

# ✅ Resumo dos Endpoints

| Entidade | Método | Rota | Descrição |
|-----------|---------|------|------------|
| Título | POST | /titles | Cria um título e gera journal |
|  | GET | /titles | Lista todos |
|  | GET | /titles/:id | Busca por ID |
|  | PATCH | /titles/:id | Atualiza |
|  | DELETE | /titles/:id | Remove |
| Entrada | POST | /entries | Cria uma entrada e gera journal |
|  | GET | /entries | Lista todas |
|  | GET | /entries/:id | Busca por ID |
|  | PATCH | /entries/:id | Atualiza |
|  | DELETE | /entries/:id | Remove |
