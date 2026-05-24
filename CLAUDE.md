# CLAUDE.md

> **IMPORTANTE: Este arquivo NUNCA deve ser enviado ao repositório remoto.** Mantenha-o apenas no ambiente local. Não fazer `git add CLAUDE.md`, não commitar e não fazer push deste arquivo sob nenhuma circunstância.

Este arquivo fornece orientações ao Claude Code (claude.ai/code) ao trabalhar com o código deste repositório.

## Visão Geral do Projeto

**Rugby na TV** é uma plataforma Next.js para compartilhar e divulgar transmissões de rugby no Brasil. Centraliza informações sobre jogos, competições e plataformas de streaming.

- **Frontend/Full-stack**: Next.js 16 com App Router e Server Components
- **Backend**: Rotas de API Node.js (REST)
- **Banco de dados**: PostgreSQL 16 com Drizzle ORM
- **Autenticação**: NextAuth v4 com credentials provider
- **Testes**: Jest com suíte de testes de integração
- **Qualidade de código**: Biome (linting e formatação)
- **Versão do Node**: 24.11.1 (ver `.nvmrc`)

## Comandos Rápidos

### Desenvolvimento
```bash
npm run dev
```
Inicia o servidor de desenvolvimento Next.js com Turbopack. Sobe automaticamente o banco de dados Docker via `docker compose`.

### Build e Execução
```bash
npm run build          # Build para produção com Turbopack
npm start             # Inicia o servidor de produção
```

### Qualidade de Código
```bash
npm run lint          # Executa o linter/checker do Biome
npm run format        # Formata o código com Biome (sobrescreve arquivos)
```

### Testes
```bash
npm test              # Executa a suíte completa de testes de integração com Jest
                      # Inicia o servidor Next.js e banco de dados Docker
                      # Limpa o banco e executa migrations antes dos testes

npm run test:watch    # Executa o Jest em modo watch (sem setup do Docker)
```

**Observação**: O `npm test` completo leva ~30-40 segundos (inicia servidor, executa testes, para o Docker). Para iteração em TDD, use `npm run test:watch` com um servidor de desenvolvimento separado.

### Banco de Dados
```bash
npm run db:generate   # Gera migration a partir de mudanças no schema
npm run db:push       # Envia migrations para o banco de dados
npm run db:migrate    # Executa migrations pendentes
npm run db:studio     # Abre a UI do Drizzle Studio (localhost:3000)
npm run db:drop       # Remove todas as tabelas (destrutivo)
docker:up/down        # Gerencia containers do banco de dados
```

### Commits
- As mensagens devem seguir o seguinte padrão: tipo:descrição
- Utilize descrições simples e diretas

### Pull Requests
- A descrição do PR deve conter apenas um breve resumo de no máximo 2 linhas
- Sem seções, checklists ou subtítulos — apenas o resumo direto

## Arquitetura

### Estrutura em Camadas

O projeto segue **clean architecture** com clara separação de responsabilidades em quatro camadas:

#### 1. **Camada de Domínio** (`/domain`)
- **Objetivo**: Regras de negócio e schemas de validação
- **Conteúdo**: Schemas Zod para contratos de API
- **Arquivos**:
  - `users/users.schema.ts` - Schema de criação de usuário (validação de email e senha)
  - `sessions/sessions.schema.ts` - Schema de credenciais de login
  - `status/status.schema.ts` - Schema de resposta do health check

**Padrão chave**: Schemas definem tanto as regras de validação quanto os tipos TypeScript via `z.infer<>`.

Tipos que não são schemas Zod (ex.: tipos de resposta de API externa) ficam em `domain/{recurso}/{recurso}.types.ts`.

- `games/games.types.ts` - Tipos `ApiGame` (shape da resposta da api-sports.io) e `Game` (formato interno mapeado)

#### 2. **Camada de Models** (`/models`)
- **Objetivo**: Lógica de negócio e acesso a dados
- **Arquivos principais**:
  - `users.ts` - Operações CRUD de usuário e gerenciamento de features (`addFeatureToUser`, `removeFeatureFromUser`, `getUserFeatures`, `hasFeature`)
  - `emailVerification.ts` - Criação e verificação de tokens de email
  - `sessions.ts` - Criação de sessão com geração de token e expiração
  - `authorization.ts` - Verificação de senha, configuração do NextAuth
  - `validator.ts` - Helper de validação de schema (centraliza o parsing Zod)
  - `migrator.ts` - Executor de migrations do banco de dados
  - `games.ts` - Integração com api-sports.io: `fetchByDate(date)` busca e mapeia jogos, `saveGames(games)` faz upsert no banco, `findById(id)` consulta por id

**Padrões chave**:
- Funções agrupadas em objetos exportados (ex.: `users.createNewUser()`)
- Acesso direto ao banco via Drizzle ORM
- Lançamento de erros (capturados pela camada de controller)
- Hash de senha com bcrypt (10 rounds)

#### 3. **Camada de Infraestrutura** (`/infra`)
- **Objetivo**: Integração com frameworks, banco de dados e utilitários
- **Arquivos principais**:
  - `database/index.ts` - Configuração do pool Drizzle, singleton `db`, helper `runQueryPool()`
  - `database/client.ts` - Cliente de uso único (transações), helper `runQueryClient()`
  - `database/schema/` - Definições de tabelas Drizzle (users, sessions, verification_tokens, features, user_features, games, channels, game_channels)
  - `database/seed.ts` - Seed das features conhecidas do sistema (fonte de verdade das features válidas)
  - `errors.ts` - Classes de erro customizadas com códigos HTTP e mensagens ao usuário (em português)
  - `controller.ts` - Middleware de tratamento de erros encapsulando os handlers de rota

**Padrões chave**:
- `db` é um singleton de pool (padrão para handlers de rota)
- `runQueryClient()` cria conexões ad-hoc (usado para migrations)
- Todos os erros herdam de `CustomError` e incluem campos `statusCode` e `action`
- O handler de erros captura erros conhecidos e encapsula desconhecidos como `InternalServerError`

#### 4. **Camada de App** (`/app`)
- **Objetivo**: Endpoints HTTP e frontend
- **Estrutura de API**: `/api/v1/{recurso}` (RESTful)
- **Rotas principais**:
  - `POST /api/v1/users` - Criar usuário (valida schema, verifica email único, faz hash da senha, cria token de verificação, adiciona feature `read:activation_token`, envia email)
  - `GET /api/v1/users` - Listar todos os usuários
  - `GET /api/v1/users/verify-email?token=` - Verificar email via token (marca `emailVerified`, remove feature `read:activation_token`)
  - `POST /api/v1/sessions` - Login (valida credenciais, cria token de sessão, define cookie HTTP-only com expiração de 7 dias)
  - `GET /api/v1/status` - Health check (versão do banco, máximo de conexões, conexões abertas)
  - `POST /api/v1/migrations` - Executar migrations pendentes

**Padrões chave**:
- Todos os handlers encapsulados com `controller.errorHandler()`
- Métodos não suportados (PUT, DELETE, PATCH) retornam 405 via `methodNotAllowedResponse()`
- Validação de requisição via `validator.validateBody(schema, body)`
- Respostas JSON com códigos de status adequados (201 para criação, 200 para sucesso, códigos de erro em caso de falha)

### Fluxo de Dados: Cadastro de Usuário

```
POST /api/v1/users
  ↓
app/api/v1/users/route.ts
  ├─ Faz parse do corpo da requisição
  ├─ Chama validator.validateBody(createUserSchema, body)
  │   └─ Lança ValidationError em caso de email/senha inválidos
  ├─ Chama users.createNewUser(body)
  │   ├─ Chama users.validateUniqueEmail()
  │   │   └─ Lança ValidationError se já existir
  │   ├─ Faz hash da senha com bcrypt
  │   └─ INSERT na tabela users via Drizzle, retorna novo usuário
  ├─ Chama emailVerification.createVerificationToken(email)
  │   └─ INSERT em verification_tokens com expiração de 24h
  ├─ Chama users.addFeatureToUser(userId, "read:activation_token")
  │   └─ Vincula feature ao usuário em user_features
  ├─ Chama mailer.sendVerificationEmail(email, token)
  └─ Retorna 201 com objeto do usuário

Fluxo de erros:
  ├─ ValidationError → 400 com { name, message, action, statusCode }
  ├─ UnauthorizedError → 401
  ├─ ServiceError → 503
  ├─ SyntaxError (JSON inválido) → 400 como ValidationError
  └─ Erro inesperado → 500 como InternalServerError
```

### Fluxo de Dados: Verificação de Email

```
GET /api/v1/users/verify-email?token=
  ↓
app/api/v1/users/verify-email/route.ts
  ├─ Extrai token da query string
  │   └─ Lança ValidationError se ausente
  └─ Chama emailVerification.verifyEmailToken(token)
      ├─ Busca token em verification_tokens
      │   └─ Lança ValidationError se não encontrado
      ├─ Verifica expiração
      │   └─ Deleta token e lança ValidationError se expirado
      ├─ Atualiza emailVerified do usuário (retorna userId via .returning())
      ├─ Deleta token de verification_tokens
      └─ Chama users.removeFeatureFromUser(userId, "read:activation_token")
```

### Schema do Banco de Dados

Oito tabelas (PostgreSQL):

1. **users**
   - `id` (UUID, PK, padrão aleatório)
   - `email` (varchar 254, único)
   - `password` (varchar 60, hash bcrypt)
   - `emailVerified` (timestamp, nullable)
   - `created_at`, `updated_at` (timestamps gerenciados automaticamente)

2. **sessions**
   - `id` (UUID, PK)
   - `sessionToken` (varchar 255, único, UUID aleatório)
   - `userId` (UUID, FK para users, cascade delete)
   - `expires` (timestamp)

3. **verification_tokens**
   - `identifier`, `token`, `expires`
   - Chave primária composta: (identifier, token)

4. **features** — catálogo de features válidas do sistema
   - `id` (UUID, PK)
   - `name` (varchar 255, único) — ex.: `"read:activation_token"`
   - `description` (varchar 500, nullable)
   - `created_at` (timestamp)

5. **user_features** — relação N:N entre users e features
   - `userId` (UUID, FK para users, cascade delete)
   - `featureId` (UUID, FK para features, cascade delete)
   - Chave primária composta: (userId, featureId)

6. **games** — jogos de rugby vindos da api-sports.io
   - `id` (integer, PK — usa o id da API externa)
   - `date` (timestamp with timezone), `timestamp` (integer)
   - `countryName`, `countryFlag` (varchar)
   - `leagueName`, `leagueLogo` (varchar)
   - `homeTeamName`, `homeTeamLogo`, `awayTeamName`, `awayTeamLogo` (varchar)
   - `scoresHome`, `scoresAway` (integer, nullable)
   - `created_at`, `updated_at` (timestamps)
   - **Upsert**: `onConflictDoUpdate` por `id` atualiza apenas `scoresHome`, `scoresAway`, `updated_at`

7. **channels** — canais/plataformas de transmissão
   - `id` (UUID, PK)
   - `name` (varchar 255, obrigatório)
   - `logo` (varchar 500, nullable)
   - `url` (varchar 500, nullable)
   - `created_at` (timestamp)

8. **game_channels** — relação N:N entre games e channels
   - `id` (UUID, PK)
   - `gameId` (integer, FK para games, cascade delete)
   - `channelId` (UUID, FK para channels, cascade delete)
   - Restrição unique em `(gameId, channelId)`

Migrations em `infra/database/migrations/`.

### Sistema de Features

Features controlam o acesso de usuários a funcionalidades do sistema. Seguem o padrão `ação:recurso` (ex.: `read:activation_token`).

**Regra fundamental**: a tabela `features` é a fonte de verdade das features válidas. `addFeatureToUser` lança `ValidationError` se a feature não estiver cadastrada.

**Seed** (`infra/database/seed.ts`): insere as features conhecidas no banco via `onConflictDoNothing` (idempotente). Chamado automaticamente pelo orchestrator de testes após cada `runMigrations()`. Ao adicionar uma nova feature ao sistema, inclua-a no array `knownFeatures` do seed.

**Features atuais**:
- `read:activation_token` — concedida ao usuário no cadastro; removida após verificação do email

**Funções disponíveis em `models/users.ts`**:
- `users.addFeatureToUser(userId, featureName)` — lança `ValidationError` se feature não existir
- `users.removeFeatureFromUser(userId, featureName)` — silencioso se feature não existir
- `users.getUserFeatures(userId)` — retorna `string[]` com os nomes das features
- `users.hasFeature(userId, featureName)` — retorna `boolean`

## Convenções e Regras de Código

**Regras obrigatórias**

1. **Sem comentários no código** - O código deve ser autoexplicativo por meio de nomenclatura clara
2. **Seguir padrões existentes** - Respeitar estrutura de imports, convenções de nomenclatura (camelCase para variáveis/funções, PascalCase para tipos), estilo de exportação (default/named) e formatação dos arquivos existentes
3. **Respeitar o Biome** - Executar `npm run lint` antes de commitar; configuração em `biome.json`

**Fluxo TDD**:

1. Planejar os cenários de teste (happy path + exceções)
2. Escrever os testes primeiro (em `tests/integration/api/v1/{recurso}/` correspondendo ao endpoint)
3. Verificar que o teste falha
4. Implementar o código de produção
5. Verificar que o teste passa
6. Refatorar com confiança

## Estratégia de Testes

### Estrutura dos Testes
- Localização: `tests/integration/api/v1/{recurso}/{método}.test.ts`
- Cada endpoint tem arquivos separados por método HTTP (GET, POST, etc.)
- Os testes são **testes de integração**, não testes unitários — testam o fluxo completo da requisição até o banco
- As descrições dos testes precisam iniciar em letras maiúsculas.
- Fixtures de dados compartilhados ficam em `tests/fixtures/{recurso}.ts`
- Respostas de APIs externas gravadas ficam em `tests/fixtures/api-responses/{endpoint}.json`

### Testando Integrações com APIs Externas

Para evitar consumo de cota e garantir testes determinísticos, usamos **gravação de fixtures HTTP**:

1. Chame a API real uma vez e grave a resposta em `tests/fixtures/api-responses/{endpoint}.json`
2. Formate o JSON com Biome (`npx biome format --write`)
3. No teste, use `jest.spyOn(global, "fetch")` para retornar a fixture:

```typescript
beforeEach(() => {
  jest.spyOn(global, "fetch").mockResolvedValue({
    json: async () => fixture,
  } as Response);
});
afterEach(() => { jest.restoreAllMocks(); });
```

Isso isola o teste da disponibilidade da API e evita depletes de cota.

### Setup dos Testes
- `tests/orchestrator.ts` fornece helpers:
  - `waitWebServer()` - Faz polling em `/api/v1/status` até o servidor estar pronto
  - `runMigrations()` - Aplica migrations pendentes e executa o seed de features
  - `cleanDb()` - Remove e recria o schema (reset completo)
  - `createTestUser()` - Cria usuário diretamente no banco (sem email/features)
  - `createTestUserViaApi()` - Cria usuário via `POST /api/v1/users` (dispara email e adiciona feature)

### Execução dos Testes
```bash
# Suíte completa (com Docker e inicialização do servidor)
npm test

# Modo watch (requer servidor de desenvolvimento rodando separadamente)
npm run test:watch
```

### Exemplo de Fluxo de Teste
```typescript
beforeAll(async () => {
  await waitWebServer();        // Aguarda o Next.js iniciar
  await cleanDb();              // Remove todas as tabelas
  await runMigrations();        // Recria o schema
});

test("POST /api/v1/users cria usuário", async () => {
  const response = await fetch("http://localhost:3000/api/v1/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@example.com", password: "Password123!" }),
  });
  expect(response.status).toBe(201);
});
```

## Workflows do GitHub

Dois workflows de CI/CD executam em pull requests:

1. **Linting** (`.github/workflows/litting.yaml`)
   - Executa `npm run lint` via Biome
   - Deve passar antes do merge

2. **Testes** (`.github/workflows/tests.yaml`)
   - Executa `npm test`
   - Inicia o banco de dados e executa a suíte completa de integração
   - Deve passar antes do merge

## Arquivos de Configuração do Projeto

- **`tsconfig.json`** - TypeScript em modo strict, alias de paths `@/*` → raiz
- **`jest.config.ts`** - Timeout Jest de 60s (alto para testes de integração), carrega `.env.development`
- **`biome.json`** - Indentação de 2 espaços, largura de linha de 140 chars, regras recomendadas para React/Next
- **`next.config.ts`** - Mínimo (sem configuração customizada ainda)
- **`drizzle.config.ts`** - Aponta para `/infra/database/schema` e `/infra/database/migrations`
- **`.editorconfig`** - Indentação de 2 espaços, quebras de linha LF

## Configuração do Ambiente

O desenvolvimento requer:
- Node 24.11.1 (gerenciado via `.nvmrc` com nvm ou equivalente)
- Docker (para o PostgreSQL)
- Arquivo `.env.development` (fornecido, com credenciais do banco LOCAL)

Padrões do banco de dados (`.env.development`):
```
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=local_user
POSTGRES_DB=local_db
POSTGRES_PASSWORD=local_password
RUGBY_API_KEY=     # placeholder vazio — chave real fica em .env.development.local
```

**Chaves de API sensíveis** usam o padrão `.env.development.local`:
- `.env.development` — commitado no git com placeholders vazios (ex.: `RUGBY_API_KEY=`)
- `.env.development.local` — gitignored, contém os valores reais por desenvolvedor
- `jest.config.ts` carrega os dois arquivos, com `.local` sobrescrevendo via `override: true`
- No CI, a variável é injetada via GitHub Actions secret (`secrets.RUGBY_API_KEY`)

## Dependências Principais

- **next**: Framework full-stack
- **next-auth**: Autenticação
- **drizzle-orm** + **drizzle-kit**: ORM type-safe e migrations
- **pg**: Driver PostgreSQL
- **bcrypt**: Hash de senha
- **zod**: Validação de schema
- **jest**: Test runner
- **biome**: Linting e formatação

## Padrões Comuns de Desenvolvimento

### Adicionando um Novo Endpoint de API

1. Criar schema de domínio em `domain/{recurso}/{recurso}.schema.ts`
2. Criar função de model em `models/{recurso}.ts`
3. Criar handler de rota em `app/api/v1/{recurso}/route.ts`
4. Encapsular handlers assíncronos com `controller.errorHandler()`
5. Usar `validator.validateBody()` para validação da requisição
6. Escrever testes de integração primeiro, depois a implementação
7. Escrever apenas testes reais de casos de usos reais, não criar situações mirabolantes

### Lançando Erros

Sempre lançar tipos de erro customizados (eles possuem códigos de status HTTP):

```typescript
throw new ValidationError("Campo inválido");
throw new UnauthorizedError("Credenciais não correspondem");
throw new ServiceError(); // Genérico 503
throw new MethodNotAllowedError();
```

### Consultas ao Banco de Dados

Use o singleton `db` (instância Drizzle) para consultas normais:

```typescript
await db.query.usersSchema.findFirst({ where: eq(usersSchema.email, "...") });
await db.insert(usersSchema).values({ ... }).returning();
```

Para transações ou isolamento, use `runQueryClient()`:

```typescript
await runQueryClient(async (db, client) => {
  // Consultas seguras para transação aqui
});
```

### Tratamento de Senhas

- **Hash**: `await bcrypt.hash(password, 10)`
- **Verificação**: `await bcrypt.compare(plainPassword, hashedPassword)` (lança `UnauthorizedError` em caso de divergência)
- Nunca logar senhas; o output do bcrypt é seguro para armazenar
