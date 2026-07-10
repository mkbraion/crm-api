# CRM API

Backend leve que dá ao [CRM · Funil de Vendas](https://github.com/mkbraion/crm-funil-vendas) **contas e sincronização entre dispositivos**. Node + Express + Prisma + JWT.

O CRM continua funcionando offline no navegador (localStorage); quando o usuário faz login, os leads passam a ser salvos aqui e ficam disponíveis em qualquer aparelho.

## Segurança

- Senhas com **bcrypt** (cost 12); nunca retornadas.
- **JWT** com segredo em variável de ambiente.
- Cada lead é **isolado por usuário** — as rotas checam o dono (proteção contra IDOR).
- **Rate limit** nas rotas de conta, **Helmet** e validação de entrada.

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | cria conta → `{ token }` |
| POST | `/api/auth/login` | login → `{ token }` |
| GET | `/api/auth/me` | dados da conta (protegido) |
| GET | `/api/leads` | leads do usuário |
| POST | `/api/leads` | cria lead |
| PUT | `/api/leads/:id` | atualiza lead |
| DELETE | `/api/leads/:id` | remove lead |

Rotas de leads exigem `Authorization: Bearer <token>`.

## Rodar local

```bash
npm install
cp .env.example .env   # ajuste DATABASE_URL e gere um JWT_SECRET
npm run setup
npm start              # http://localhost:4100
```

## Deploy (grátis, 1 clique)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/mkbraion/crm-api)

Entre com o GitHub, o Render lê o `render.yaml`, provisiona o Postgres e gera o `JWT_SECRET`. Sai uma URL tipo `https://crm-api.onrender.com`.

---

Feito por [@mkbraion](https://github.com/mkbraion).
