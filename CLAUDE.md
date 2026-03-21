# EquaObra — CLAUDE.md

## Papel
Você é um arquiteto e engenheiro de software sênior.
Seu objetivo é construir código limpo, escalável e bem organizado.
Nunca crie soluções genéricas. Sempre pense em reuso, coesão e separação de responsabilidades.

---

## Sobre o Projeto
**EquaObra** é uma plataforma de montagem de equipes para obras de pequeno a grande porte.

### Funcionalidades principais
- Busca e filtro de profissionais por localidade e avaliação
- Montagem de equipes personalizadas por obra
- Chat interno entre contratante e profissional
- Visualização do WhatsApp do profissional
- Perfil de profissionais com histórico e avaliações

---

## Stack
- **Frontend:** React + TypeScript
- **Estilização:** Tailwind CSS + Design System próprio
- **Estado global:** Redux Toolkit ou Zustand (decidir antes de iniciar)
- **Roteamento:** React Router v6
- **Testes:** Jest + Testing Library
- **Backend:** (definir — sugestão: Node.js + Prisma + PostgreSQL)

---

## Estrutura de Pastas

```
src/
├── assets/                  # Imagens, ícones, fontes
├── components/              # Componentes reutilizáveis globais
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx
│   ├── Avatar/
│   ├── Badge/
│   ├── Card/
│   └── Input/
├── design-system/           # Tokens de design (cores, tipografia, espaçamento)
│   ├── tokens.ts
│   └── theme.ts
├── features/                # Funcionalidades por domínio
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── auth.service.ts
│   ├── professional/
│   │   ├── components/
│   │   │   ├── ProfessionalCard/
│   │   │   │   ├── ProfessionalCard.tsx
│   │   │   │   └── ProfessionalCard.test.tsx
│   │   │   └── ProfessionalList/
│   │   ├── hooks/
│   │   │   └── useProfessionals.ts
│   │   ├── pages/
│   │   │   ├── ProfessionalSearch/
│   │   │   └── ProfessionalProfile/
│   │   └── professional.service.ts
│   ├── team/
│   │   ├── components/
│   │   │   ├── TeamBuilder/
│   │   │   └── TeamList/
│   │   ├── hooks/
│   │   │   └── useTeam.ts
│   │   ├── pages/
│   │   │   ├── TeamCreate/
│   │   │   └── TeamDetail/
│   │   └── team.service.ts
│   ├── chat/
│   │   ├── components/
│   │   │   ├── ChatWindow/
│   │   │   └── MessageBubble/
│   │   ├── hooks/
│   │   │   └── useChat.ts
│   │   └── chat.service.ts
│   └── obra/
│       ├── components/
│       ├── hooks/
│       └── obra.service.ts
├── hooks/                   # Hooks globais reutilizáveis
│   ├── useDebounce.ts
│   ├── useGeolocation.ts
│   └── usePagination.ts
├── layouts/                 # Layouts de página
│   ├── MainLayout/
│   └── AuthLayout/
├── pages/                   # Páginas raiz (roteamento)
├── routes/                  # Configuração de rotas
│   └── index.tsx
├── services/                # Chamadas de API globais
│   └── api.ts
├── store/                   # Estado global
│   └── index.ts
├── types/                   # Tipos e interfaces globais
│   ├── professional.types.ts
│   ├── team.types.ts
│   └── user.types.ts
└── utils/                   # Funções utilitárias puras
    ├── formatPhone.ts
    ├── formatRating.ts
    └── geolocation.ts
```

---

## Convenções de Nomenclatura

| Tipo | Convenção | Exemplo |
|---|---|---|
| Componente | PascalCase | `ProfessionalCard.tsx` |
| Hook | camelCase com "use" | `useProfessionals.ts` |
| Service | camelCase + .service | `team.service.ts` |
| Types | camelCase + .types | `professional.types.ts` |
| Pasta | PascalCase (feature/component) | `ProfessionalCard/` |
| Variáveis/funções | camelCase | `fetchProfessionals` |
| Constantes | UPPER_SNAKE_CASE | `MAX_TEAM_SIZE` |

---

## Regras de Criação de Arquivos

- Todo componente vive em sua própria pasta com o mesmo nome
- Todo componente deve ter um arquivo de teste junto
- Nunca criar componente genérico sem propósito claro
- Exemplo obrigatório de estrutura:

```
ProfessionalCard/
├── ProfessionalCard.tsx       # Componente
├── ProfessionalCard.test.tsx  # Testes
├── ProfessionalCard.types.ts  # Tipos locais (se necessário)
└── index.ts                   # Re-export limpo
```

---

## Design System

- Nunca usar cores ou tamanhos hardcoded — sempre via tokens
- Todos os componentes base (Button, Input, Badge, Avatar) devem vir do design system
- Nunca criar telas genéricas — cada tela tem identidade visual clara
- Paleta deve remeter ao setor de construção: tons terrosos, laranjas, cinzas

```ts
// design-system/tokens.ts
export const colors = {
  primary: '#E07B2A',      // laranja construção
  secondary: '#3B3B3B',    // cinza escuro
  surface: '#F5F0EB',      // fundo bege claro
  success: '#4CAF50',
  danger: '#E53935',
  text: {
    primary: '#1A1A1A',
    secondary: '#6B6B6B',
  }
}
```

---

## Componentização

- Componentes devem ser pequenos e com responsabilidade única
- Props sempre tipadas com interface (nunca `any`)
- Evitar prop drilling — usar contexto ou estado global quando necessário
- Separar lógica de apresentação: hooks para lógica, componente para UI

---

## Testes

- Todo componente deve ter pelo menos um teste de renderização
- Testar comportamentos, não implementação
- Usar `screen.getByRole` e `screen.getByText` (evitar `getByTestId` em excesso)
- Mocks de serviços sempre em `__mocks__/`

---

## O que NUNCA fazer

- ❌ Criar telas genéricas sem identidade (ex: "tela de lista" sem contexto)
- ❌ Usar `any` no TypeScript
- ❌ Duplicar lógica — sempre extrair para hook ou util
- ❌ Componentes com mais de 200 linhas sem justificativa
- ❌ Misturar lógica de negócio dentro do JSX
- ❌ Hardcodar strings — usar constantes ou i18n
- ❌ Commitar código com console.log
- ❌ Criar arquivo sem pasta correspondente (componente solto)

---

## Fluxo de Desenvolvimento

1. Definir tipos primeiro (`types/`)
2. Criar o service (`feature.service.ts`)
3. Criar o hook (`useFeature.ts`)
4. Construir componentes do menor para o maior
5. Escrever testes junto com o componente
6. Montar a página por último

---

## Domínios do Sistema

- **Professional** — profissional cadastrado (pedreiro, eletricista, etc.)
- **Obra** — projeto/obra criado pelo contratante
- **Team** — equipe montada para uma obra
- **Chat** — conversa entre contratante e profissional
- **User** — usuário autenticado (pode ser contratante ou profissional)
