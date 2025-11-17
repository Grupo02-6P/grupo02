# Como Gerenciar o Dump do Banco de Dados com Docker

Este guia descreve como restaurar (inserir) e criar um backup (dump) do banco de dados PostgreSQL quando ele está rodando em um contêiner Docker gerenciado pelo `docker-compose`.

## Contexto

O ambiente de desenvolvimento utiliza um serviço `postgres` no Docker. O arquivo `backup.dump` é usado para garantir que todos os desenvolvedores trabalhem com uma base de dados consistente.

---

## Como Inserir/Restaurar o Dump

Existem duas maneiras principais de restaurar o banco de dados a partir do arquivo `backup.dump`.

### Método 1: Restauração Automática com `docker-compose` (Recomendado)

O arquivo `docker-compose.yml` no diretório `contabil-backend` já possui um serviço chamado `db-seed` que restaura o dump automaticamente ao iniciar o ambiente, **se o banco de dados estiver vazio**.

**Passos:**

1.  **Localize o arquivo de dump:**
    Certifique-se de que o arquivo `backup.dump` está localizado na pasta `contabil-backend`. Se ele estiver na raiz do projeto, mova-o para `contabil-backend/`.

2.  **Inicie o ambiente:**
    Navegue até a pasta `contabil-backend` e execute o `docker-compose`.

    ```powershell
    cd c:\BIOPARK\INTEGRADOR\contabil-backend
    docker compose up --build
    ```

    O serviço `db-seed` verificará o banco e, se necessário, fará a restauração.

### Método 2: Restauração Manual

Use este método se precisar restaurar o banco de dados enquanto os contêineres já estão em execução.

**Passos:**

1.  **Inicie os contêineres (se ainda não estiverem rodando):**
    ```powershell
    cd c:\BIOPARK\INTEGRADOR\contabil-backend
    docker compose up -d postgres
    ```

2.  **Identifique o nome do contêiner do Postgres:**
    Liste os contêineres para encontrar o nome correto.
    ```powershell
    docker ps
    ```
    O nome será algo como `contabil-backend-postgres-1`.

3.  **Copie o dump para o contêiner:**
    Copie o arquivo `backup.dump` da sua máquina local para dentro do contêiner.
    ```powershell
    # Se o dump está na raiz do projeto
    docker cp C:\BIOPARK\INTEGRADOR\backup.dump <nome_do_container_postgres>:/tmp/backup.dump

    # Se o dump está na pasta do backend
    docker cp C:\BIOPARK\INTEGRADOR\contabil-backend\backup.dump <nome_do_container_postgres>:/tmp/backup.dump
    ```

4.  **Execute o `pg_restore` dentro do contêiner:**
    Acesse o contêiner e execute o comando de restauração.
    ```powershell
    docker exec -it <nome_do_container_postgres> pg_restore --username=postgres --dbname=contabilize --clean --if-exists /tmp/backup.dump
    ```

---

## Como Criar um Backup (Gerar um novo `backup.dump`)

Após fazer alterações significativas no banco de dados, gere um novo dump para manter a equipe sincronizada.

**Passos:**

1.  **Identifique o nome do contêiner do Postgres** (use `docker ps` se necessário).

2.  **Execute o `pg_dump` dentro do contêiner:**
    Este comando cria o arquivo de dump dentro do contêiner.
    ```powershell
    docker exec -it <nome_do_container_postgres> pg_dump --username=postgres --dbname=contabilize --format=custom -f /tmp/backup.dump
    ```

3.  **Copie o dump do contêiner para sua máquina:**
    Copie o arquivo gerado de volta para a pasta `contabil-backend` na sua máquina local.
    ```powershell
    docker cp <nome_do_container_postgres>:/tmp/backup.dump C:\BIOPARK\INTEGRADOR\contabil-backend\backup.dump
    ```

4.  **Envie para o Repositório:**
    Adicione o `backup.dump` atualizado ao Git para que o resto da equipe possa usá-lo.
    ```bash
    git add contabil-backend/backup.dump
    git commit -m "Atualiza o dump do banco de dados"
    git push
    ```
