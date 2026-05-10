# Rugby na TV

Plataforma para centralizar e divulgar transmissões de rugby no Brasil, organizando jogos por data, campeonato e plataforma de streaming.

## Tecnologias

- **Next.js 16** — App Router, Server Components
- **PostgreSQL 16** com **Drizzle ORM**
- **NextAuth v4** — autenticação por sessão com banco de dados
- **Nodemailer** — envio de e-mails transacionais via SMTP
- **Jest** — testes de integração
- **Biome** — lint e formatação

## Endpoints

### Status
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/status` | Health check: versão do banco, conexões e status do mailer |

### Usuários
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/users` | Cadastro de usuário |
| GET | `/api/v1/users` | Lista todos os usuários |
| GET | `/api/v1/users/verify-email?token=` | Verifica e-mail via token |
| POST | `/api/v1/users/verify-email/resend` | Reenvio do e-mail de verificação |

### Sessões
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/sessions` | Login — cria sessão e define cookie HTTP-only |

## Fluxos principais

### Cadastro
1. `POST /api/v1/users` com `{ email, password }`
2. Usuário criado, token de verificação gerado e e-mail enviado
3. Usuário clica no link → `GET /api/v1/users/verify-email?token=`
4. E-mail confirmado, acesso liberado para login

> Caso o e-mail não chegue: `POST /api/v1/users/verify-email/resend` com `{ email }`.
> Há cooldown de 1 minuto entre reenvios.

### Login
1. `POST /api/v1/sessions` com `{ email, password }`
2. Credenciais validadas — e-mail **deve** estar verificado
3. Cookie `session_token` definido com expiração de 7 dias

## Desenvolvimento

```bash
npm run dev          # inicia Next.js + banco Docker
npm test             # roda suíte de integração completa
npm run lint         # checa código com Biome
npm run db:migrate   # aplica migrations pendentes
npm run db:studio    # abre Drizzle Studio
```

Requer Node 24.11.1 e Docker. Copie `.env.development` e preencha as variáveis locais conforme necessário.
