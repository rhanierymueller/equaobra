# EquaObra API

Node.js + Express + Prisma + SQLite

## Setup

```bash
cd api
npm install
cp .env.example .env   # edite JWT_SECRET
npm run db:push        # cria o banco SQLite
npm run db:seed        # popula com profissionais demo
npm run dev            # http://localhost:3001
```

## Endpoints

### Auth
| Method | Path | Auth |
|--------|------|------|
| POST | /api/auth/register | — |
| POST | /api/auth/login | — |

### Users / Profissionais
| Method | Path | Auth |
|--------|------|------|
| GET | /api/users/me | ✅ |
| PATCH | /api/users/me | ✅ |
| GET | /api/users/professionals?search=&city=&profession=&minRating=&available= | — |
| GET | /api/users/:id | — |

### Oportunidades
| Method | Path | Auth |
|--------|------|------|
| GET | /api/opportunities?city=&profession= | — |
| GET | /api/opportunities/mine | ✅ |
| GET | /api/opportunities/:id | — |
| POST | /api/opportunities | ✅ |
| PATCH | /api/opportunities/:id | ✅ |
| DELETE | /api/opportunities/:id | ✅ |

### Equipes
| Method | Path | Auth |
|--------|------|------|
| GET | /api/teams | ✅ |
| POST | /api/teams | ✅ |
| GET | /api/teams/:id | ✅ |
| PATCH | /api/teams/:id | ✅ |
| DELETE | /api/teams/:id | ✅ |
| POST | /api/teams/:id/members | ✅ |
| PATCH | /api/teams/:id/members/:professionalId | ✅ |
| DELETE | /api/teams/:id/members/:professionalId | ✅ |

### Registros de Horas
| Method | Path | Auth |
|--------|------|------|
| GET | /api/teams/:id/worklogs | ✅ |
| POST | /api/teams/:id/worklogs | ✅ |
| DELETE | /api/teams/:id/worklogs/:logId | ✅ |

### Interesses (candidaturas)
| Method | Path | Auth |
|--------|------|------|
| GET | /api/interests?as=contractor | ✅ |
| GET | /api/interests/contractor/:contractorId | — |
| POST | /api/interests | ✅ |
| DELETE | /api/interests/:id | ✅ |

### Chat
| Method | Path | Auth |
|--------|------|------|
| GET | /api/chats | ✅ |
| POST | /api/chats | ✅ |
| GET | /api/chats/:id | ✅ |
| POST | /api/chats/:id/messages | ✅ |

### Notificações
| Method | Path | Auth |
|--------|------|------|
| GET | /api/notifications | ✅ |
| POST | /api/notifications | ✅ |
| PATCH | /api/notifications/read-all | ✅ |
| PATCH | /api/notifications/:id/read | ✅ |
| DELETE | /api/notifications/:id | ✅ |

## Autenticação

Todas as rotas marcadas com ✅ requerem header:
```
Authorization: Bearer <token>
```

O token é retornado no login/register.

## Demo

- Email: `contratante@equaobra.com` / senha: `123456`
- 16 profissionais seed com email `nome.sobrenome.prof@equaobra.com` / senha: `123456`
