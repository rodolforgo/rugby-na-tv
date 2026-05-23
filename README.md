# Rugby na TV

Plataforma colaborativa e open-source para centralizar transmissões de rugby no Brasil. Os jogos são sincronizados automaticamente com fontes externas e a comunidade pode indicar e confirmar onde cada partida será transmitida — seja em canais de TV aberta, fechada ou serviços de streaming.

## Tecnologias

- **Next.js 16** — App Router, Server Components e Server Actions
- **PostgreSQL 16** com **Drizzle ORM** — banco relacional e migrations
- **Tailwind CSS** + **DaisyUI** — estilização e componentes
- **Nodemailer** — envio de e-mails transacionais via SMTP
- **Zod** — validação de schemas
- **Jest** — testes de integração
- **Biome** — lint e formatação

## Endpoints

### Status
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/status` | Health check: versão do banco e conexões ativas |

### Usuários
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/users` | Cadastro de novo usuário |
| GET | `/api/v1/users/verify-email?token=` | Confirmação de e-mail via token |
| POST | `/api/v1/users/verify-email/resend` | Reenvio do e-mail de confirmação |

### Sessões
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/sessions` | Login — cria sessão e define cookie HTTP-only |

### Jogos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/games` | Lista jogos com canais e votos |
| POST | `/api/v1/games/api-sports` | Sincroniza jogos da API Sports (requer `SYNC_SECRET`) |
| GET | `/api/v1/games/ronin-api` | Sincroniza transmissões da Ronin Media API (requer `SYNC_SECRET`) |
| POST | `/api/v1/games/:id/votes` | Registra ou atualiza voto em um canal |
| DELETE | `/api/v1/games/:id/votes` | Remove voto |

## Desenvolvimento

### Pré-requisitos

- Node 24.11.1 (recomendado via [nvm](https://github.com/nvm-sh/nvm))
- Docker (para o PostgreSQL local)

### Configuração

```bash
git clone https://github.com/rodolforgo/rugby-na-tv.git
cd rugby-na-tv
nvm use          # ou: node >= 24
npm install
```

Copie o arquivo de variáveis e preencha os valores necessários:

```bash
cp .env.development .env.development.local
# edite .env.development.local com suas credenciais
```

### Rodando localmente

```bash
npm run dev        # inicia Next.js + sobe o banco via Docker
npm run db:migrate # aplica migrations pendentes
npm run db:studio  # abre o Drizzle Studio em localhost:3000
```

### Testes

```bash
npm test           # suíte completa de integração (inicia Docker automaticamente)
npm run test:watch # modo watch — requer servidor e banco já rodando
```

### Qualidade de código

```bash
npm run lint       # checa com Biome
npm run format     # formata com Biome
```

## Como contribuir

1. Faça um fork do repositório
2. Crie uma branch a partir da `main`: `git checkout -b feature/sua-feature`
3. Implemente seguindo os padrões do projeto (Biome para lint, testes de integração para novas funcionalidades)
4. Abra um Pull Request descrevendo o que foi feito

Issues abertas com sugestões e bugs estão disponíveis na aba [Issues](https://github.com/rodolforgo/rugby-na-tv/issues). Contribuições de qualquer natureza são bem-vindas.
