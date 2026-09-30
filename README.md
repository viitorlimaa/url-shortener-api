# URL Shortener API

API para criar links curtos, redirecionar para os endereços originais e acompanhar cliques.

## Hospedagem

A API está hospedada no Render:

- **Base da API:** <https://url-shortener-api-8j5z.onrender.com>
- **Documentação interativa (Swagger):** <https://url-shortener-api-8j5z.onrender.com/docs>

O PostgreSQL é um serviço separado. Configure `DATABASE_URL` na aplicação Render com a URL de conexão fornecida pelo banco; o endereço acima é o host da API, não a URL do banco. A aplicação também precisa de um Redis acessível por `REDIS_URL` para o rate limiting.

---

## Tecnologias

- NestJS e TypeScript
- PostgreSQL, Prisma e Redis
- Docker Compose
- Vitest
- GitHub Actions

---

## Requisitos

- Node.js 20+
- pnpm 12.4.1
- PostgreSQL e Redis
- Docker e Docker Compose (opcionais)

## Endpoints

Todas as rotas da API usam o prefixo `/api`. As rotas marcadas como Bearer exigem o token retornado pelo cadastro ou login, no cabeçalho `Authorization: Bearer <accessToken>`.

| Método   | Endpoint             | Acesso  | Descrição                                    |
| -------- | -------------------- | ------- | -------------------------------------------- |
| `POST`   | `/api/auth/register` | Público | Cadastra usuário e retorna token             |
| `POST`   | `/api/auth/login`    | Público | Autentica usuário e retorna token            |
| `GET`    | `/api/auth/me`       | Bearer  | Retorna a identidade autenticada             |
| `POST`   | `/api/links`         | Bearer  | Cria um link curto                           |
| `GET`    | `/api/links`         | Bearer  | Lista os links do usuário autenticado        |
| `GET`    | `/api/r/:code`       | Público | Registra clique e redireciona para o destino |
| `GET`    | `/api/analytics`     | Bearer  | Retorna analytics do usuário autenticado     |
| `GET`    | `/api/users`         | Bearer  | Retorna o usuário autenticado                |
| `GET`    | `/api/users/:id`     | Bearer  | Busca usuário conforme regra de acesso       |
| `PATCH`  | `/api/users/:id`     | Bearer  | Atualiza usuário conforme regra de acesso    |
| `DELETE` | `/api/users/:id`     | Bearer  | Exclui usuário conforme regra de acesso      |

O Swagger está disponível em `/docs` no host da aplicação.

## Exemplo: criar e acessar um link

Cadastre uma conta (ou use `/api/auth/login` se já tiver uma):

```bash
curl -X POST https://url-shortener-api-8j5z.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Seu Nome","email":"voce@example.com","password":"SenhaForte123!"}'
```

A resposta contém `accessToken`. Use-o para criar o link; `customCode` é opcional:

```bash
curl -X POST https://url-shortener-api-8j5z.onrender.com/api/links \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -d '{"original":"https://www.example.com/artigos/introducao","customCode":"meu-artigo"}'
```

O `shortCode` retornado será `meu-artigo` neste exemplo. O endereço para compartilhar é:

```text
https://url-shortener-api-8j5z.onrender.com/api/r/meu-artigo
```

Sem `customCode`, a API gera um código aleatório de 8 caracteres. Códigos personalizados aceitam de 3 a 50 letras minúsculas sem acento, números e hífens; são normalizados para minúsculas e precisam ser únicos. Códigos duplicados retornam HTTP 409.

## Rate limiting

- Criação de links: até 10 requisições por IP a cada minuto.
- Redirecionamentos: até 60 requisições por IP a cada minuto.
- Ao exceder o limite, a API retorna HTTP 429 e o cabeçalho `Retry-After`.

O rate limiting usa Redis, então a aplicação precisa conseguir conectar ao endereço configurado em `REDIS_URL`.

## Executar localmente

Requisitos: Node.js 20+, pnpm 12.4.1, PostgreSQL e Redis. Docker e Docker Compose podem ser usados para executar os serviços localmente.

Instale as dependências e crie o arquivo de ambiente (PowerShell):

```powershell
pnpm install
Copy-Item .env.example .env
```

Configure `DATABASE_URL` para o PostgreSQL e `REDIS_URL` para o Redis. Antes de iniciar a API com um banco vazio, aplique as migrations:

```bash
pnpm exec prisma migrate deploy
```

Para usar o Docker Compose, o healthcheck atual espera `POSTGRES_DB=nest_api` e `POSTGRES_USER=postgres`; configure também a `DATABASE_URL` com esses valores e com a senha definida em `POSTGRES_PASSWORD`. Dentro da rede do Compose, o host do PostgreSQL é `db` e o do Redis é `redis`. Depois de subir os serviços, aplique as migrations no container da API com `docker compose exec app pnpm exec prisma migrate deploy`.

Inicie a API em desenvolvimento:

```bash
pnpm start:dev
```

A API local fica em `http://localhost:3000`; o Swagger fica em `http://localhost:3000/docs`.

Para iniciar os serviços definidos no Docker Compose:

```bash
docker compose up --build
```

Para build e execução em modo de produção:

```bash
pnpm build
pnpm start:prod
```

## Variáveis de ambiente

| Variável            | Descrição                                     |
| ------------------- | --------------------------------------------- |
| `DATABASE_URL`      | URL de conexão PostgreSQL usada pelo Prisma   |
| `REDIS_URL`         | URL de conexão Redis usada pelo rate limiting |
| `PORT`              | Porta HTTP da aplicação (padrão: `3000`)      |
| `JWT_SECRET`        | Segredo privado usado para assinar tokens JWT |
| `NODE_ENV`          | Ambiente de execução                          |
| `POSTGRES_DB`       | Nome do banco PostgreSQL no Docker Compose    |
| `POSTGRES_USER`     | Usuário PostgreSQL no Docker Compose          |
| `POSTGRES_PASSWORD` | Senha PostgreSQL no Docker Compose            |

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

## Estrutura principal

```text
src/
  common/rate-limit/  # Rate limiting com Redis
  modules/
    analytics/        # Consultas de analytics
    auth/             # Cadastro, login e JWT
    links/            # Criação, listagem e redirecionamento
    user/             # Operações de usuário
  prisma/             # Serviço Prisma
  main.ts             # Prefixo /api e configuração Swagger
prisma/
  migrations/
  schema.prisma
test/                 # Testes da aplicação
```

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

```

```
