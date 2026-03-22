# EquaObra Mobile

Aplicativo React Native (Expo) da plataforma EquaObra.

## Setup

```bash
cd mobile
npm install
npx expo start
```

## Configurar IP da API

Edite `src/services/api.ts` e altere `API_BASE` para o IP da sua máquina na rede local:

```ts
export const API_BASE = 'http://192.168.1.100:3001'  // seu IP local
```

Para descobrir seu IP:
- macOS: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Windows: `ipconfig`

## Rodar a API

```bash
cd ../api
npm run dev
```

## Telas

- **Ponto** — Registrar horas trabalhadas por equipe (feature principal)
- **Obras** — Explorar vagas disponíveis e se candidatar
- **Equipes** — Gerenciar equipes e membros
- **Explorar** — Buscar profissionais
- **Perfil** — Editar dados e sair
