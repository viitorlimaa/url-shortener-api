# URL Shortener API

API para encurtar URLs longas, redirecionar o usuário para a URL original e registrar métricas de acesso.

## Visão geral

Este projeto é uma API backend em NestJS para criação e gestão de links curtos. A ideia central é permitir que usuários autenticados criem links, compartilhem os códigos gerados e acompanhem cliques e analytics.

### Objetivo

- encurtar links longos em códigos curtos
- redirecionar publicamente o usuário para a URL original
- manter controle dos links criados por cada usuário
- registrar cliques e métricas de uso
- aplicar rate limiting para evitar abuso

### Fluxo principal

1. Usuário faz login
2. Cria um novo link curto
3. Compartilha o código gerado
4. Qualquer pessoa acessa o link curto
5. O sistema redireciona para a URL original
6. O clique é registrado para analytics

---

## Stack tecnológica

- NestJS + TypeScript
- PostgreSQL + Prisma
- Docker + Docker Compose
- Vitest
- GitHub Actions

---

## Requisitos

- Node.js 20+
- pnpm 12.4.1
- Docker e Docker Compose
- PostgreSQL (opcional se usar Docker)

---

## Instalação

Clone o projeto e instale as dependências:

```bash
git clone <seu-repositorio>
cd url-shortener
pnpm install
```

Crie um arquivo de ambiente local com as variáveis necessárias:

```bash
cp .env.example .env
```

Exemplo seguro de `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
PORT=3000
REDIS_URL="redis://localhost:6379"
```
---

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| DATABASE_URL | URL de conexão com o PostgreSQL |
| PORT | Porta da API |
| REDIS_URL | URL do Redis usado pelo rate limiting |

---

## Rodando localmente

### Desenvolvimento

```bash
pnpm start:dev
```

### Produção

```bash
pnpm build
pnpm start:prod
```

### Com Docker

```bash
docker compose up --build
```

Isso sobe:

- a API em porta 3000
- o banco PostgreSQL em porta 5432
- o Redis em porta 6379

## Analytics e limites

Cada acesso a `GET /api/:code` cria um registro de clique. Usuários autenticados consultam seus dados em `GET /api/analytics`, com total por link e agrupamento diário.

O endpoint `POST /api/links` aceita até 10 requisições por IP a cada minuto. Redirects aceitam até 60 requisições por IP a cada minuto. O excesso retorna HTTP 429 e o cabeçalho `Retry-After`.

---

## Scripts disponíveis

```bash
pnpm build
pnpm start
pnpm start:dev
pnpm start:debug
pnpm start:prod
pnpm lint
pnpm test
pnpm test:watch
pnpm test:cov
pnpm test:e2e
```

---

## Estrutura do projeto

```text
src/
  app.module.ts
  app.controller.ts
  app.service.ts
  main.ts
  prisma/
  users/
  auth/
  links/
  analytics/
prisma/
  schema.prisma
  migrations/
.test/
Dockerfile
docker-compose.yml
vitest.config.ts
vitest.config.e2e.ts
package.json
```

---

## Arquitetura

O projeto foi pensado em módulos e separação de responsabilidades:

- AuthModule: autenticação, cadastro e login
- UsersModule: dados do usuário
- LinksModule: criação e listagem de links
- AnalyticsModule: métricas e cliques
- PrismaModule: acesso ao banco

A ideia é manter regras de negócio, autenticação e persistência separadas para facilitar manutenção e testes.

---

## MVP e roadmap

### Must Have

- criar link curto
- redirecionar GET /:code para a URL original
- autenticação para gestão de links
- registro de clique
- rate limiting

### Should Have

- listagem de links do usuário
- contagem de cliques
- expiração opcional de link
- analytics básicos por dia

### Nice to Have

- slug customizado
- códigos personalizados por usuário
- geolocalização e dados do requisitante

---

## CI/CD

O projeto já conta com workflow de GitHub Actions para executar:

- instalação das dependências
- geração do Prisma Client
- lint
- testes
- build da aplicação

---

## Contribuição

1. Crie uma branch para a funcionalidade ou correção
2. Faça as alterações
3. Execute testes e lint
4. Abra um Pull Request explicando o que foi feito

---

## Observações

Este projeto foi desenhado como um backend de portfólio/serviço realista de encurtador de URLs, com foco em arquitetura limpa, boas práticas e facilidade de execução local.

