# URL Shortener API — Guia de Desenvolvimento

Este documento descreve o que é o projeto, as decisões técnicas por trás dele e o passo a passo de construção, para que qualquer pessoa consiga entender o contexto e continuar (ou reproduzir) o desenvolvimento.

---

## 1. Visão Geral do Produto

Uma API que encurta URLs longas, redireciona o usuário público para a URL original e registra métricas de acesso (cliques, quando aconteceram). Usuários autenticados podem criar e gerenciar seus próprios links; o redirecionamento em si é público. O sistema aplica rate limiting para evitar abuso.

**Problema que resolve:** compartilhar links longos de forma prática, com controle de quem criou o link e visibilidade sobre o engajamento.

**Usuário:** pessoas que precisam compartilhar links (ex: em redes sociais, campanhas, materiais) e querem acompanhar quantos cliques cada link recebeu.

**Fluxo principal:**
```
Usuário se autentica → cria um link curto a partir de uma URL longa
   → compartilha o link curto → qualquer pessoa acessa e é redirecionada
   → cada acesso é registrado → usuário consulta analytics dos seus links
```

---

## 2. Escopo do MVP

### Must Have
- Criar link curto a partir de uma URL longa
- Redirecionar `GET /:code` para a URL original
- Autenticação (para gerenciar os próprios links)
- Registro de clique (contagem + timestamp)
- Rate limiting no endpoint de criação e no redirect

### Should Have
- Listagem dos links do usuário com contagem de cliques
- Expiração de link (opcional, com data)
- Analytics básico (cliques por dia)

### Nice to Have
- Código customizado (slug escolhido pelo usuário)
- Geolocalização/IP no analytics (via header, sem serviço externo)

### Out of Scope (deliberadamente fora do MVP)
- Encurtamento em massa (bulk)
- Domínio customizado (branded links)
- Dashboard visual (frontend) — o foco deste projeto é backend

> Por que isso importa: manter esse escopo evita que o projeto vire um sistema empresarial antes da hora. Qualquer sugestão de funcionalidade nova deve ser avaliada contra essa lista antes de ser aceita.

---

## 3. Premissas Assumidas

Decisões tomadas por padrão, na ausência de restrições explícitas — podem ser revisadas se houver motivo concreto:

- **Autenticação via JWT** (email/senha), por ser simples de implementar e testar, e padrão de mercado.
- **Redis para rate limiting e cache**, em vez de solução em memória ou via Postgres — mais próximo do que se usa em produção real, e reforça o portfólio.
- **Redirect é público**, sem exigir login; apenas criação e gestão de links exigem autenticação.

---

## 4. Stack e Motivação

| Área | Tecnologia | Por que |
|---|---|---|
| Backend | NestJS + TypeScript | Estrutura modular nativa facilita separar responsabilidades (controllers, services, módulos) de forma clara e testável |
| Database | PostgreSQL + Prisma | Persistência relacional para links e cliques; Prisma dá tipagem segura e migrations versionadas |
| Cache / Rate limit | Redis | Rate limiting real e contagem de cliques com baixa latência, sem sobrecarregar o Postgres |
| Auth | JWT (`@nestjs/jwt` + `passport-jwt`) | Simples de implementar, fácil de testar, e é o que o mercado espera ver num projeto de portfólio |
| Testes | Vitest | Ferramenta de testes definida para o projeto |
| Infra | Docker + Docker Compose | Sobe Postgres + Redis + aplicação localmente com um único comando, reproduzível em qualquer máquina |
| CI/CD | GitHub Actions | Lint, typecheck, testes e build automatizados a cada Pull Request |

---

## 5. Arquitetura

```
Cliente
  │
  ├── POST /links (autenticado) ──► LinksController ──► LinksService ──► Prisma ──► Postgres
  │
  ├── GET /:code (público) ──► RedirectController ──► valida rate limit (Redis)
  │                              └──► registra clique (Postgres)
  │                              └──► 302 redirect
  │
  └── GET /links/:id/analytics (autenticado) ──► AnalyticsService ──► Prisma (agregação)
```

**Módulos:**
- `AuthModule` — cadastro, login, emissão e validação de JWT
- `UsersModule` — dados do usuário
- `LinksModule` — criação, listagem e redirecionamento de links
- `AnalyticsModule` — agregação de cliques
- `PrismaModule` — acesso ao banco, compartilhado entre módulos

**Por que essa separação:** cada módulo tem uma responsabilidade única. Isso facilita testar cada parte isoladamente e evita que regras de autenticação se misturem com regras de negócio do encurtador.

---

## 6. Etapas de Desenvolvimento (com contexto)

### Fase 1 — Fundação
**Objetivo:** ter uma base de projeto limpa antes de qualquer regra de negócio.
**Por que primeiro:** qualquer decisão de estrutura tomada aqui evita retrabalho nas fases seguintes. Sem isso, cada módulo novo herdaria inconsistências.

- **Setup do projeto** — Nest + TypeScript, ESLint, Prettier, estrutura de pastas (`src/modules`, `src/common`, `src/config`), Vitest configurado no lugar do Jest padrão.
- **Docker Compose** — sobe Postgres e Redis localmente, garantindo que qualquer pessoa reproduza o ambiente com um comando.
- **Configuração do Prisma** — conexão com o banco e schema inicial (`User`).

**Critério de saída da fase:** `npm run start:dev` sobe sem erro, `/health` responde 200, `docker compose up` sobe Postgres e Redis, lint e testes rodam (mesmo vazios).

---

### Fase 2 — Autenticação
**Objetivo:** permitir que usuários se cadastrem e façam login, protegendo os endpoints de gestão de links.
**Por que agora:** os links pertencem a um usuário — não faz sentido implementar o core do encurtador sem ter "quem" está criando o link.

- Endpoint de cadastro (hash de senha, nunca texto puro)
- Endpoint de login (retorna JWT)
- Guard de autenticação reutilizável para proteger rotas privadas

**Critério de saída da fase:** um usuário consegue se cadastrar, logar, e acessar uma rota protegida de teste apenas com token válido.

---

### Fase 3 — Core (Encurtador)
**Objetivo:** implementar a funcionalidade central do produto.
**Por que agora:** só faz sentido depois de ter autenticação, já que os links são vinculados a um dono.

- Entidade `Link` + migration (URL original, código curto, dono, data de criação, expiração opcional)
- Endpoint de criação de link (gera código curto único)
- Endpoint de redirecionamento público (`GET /:code`) que busca a URL original e responde com redirect HTTP

**Critério de saída da fase:** um usuário autenticado cria um link, e qualquer pessoa (sem login) consegue acessar `GET /:code` e ser redirecionada corretamente.

---

### Fase 4 — Analytics e Rate Limiting
**Objetivo:** registrar e expor métricas de uso, e proteger a API contra abuso.
**Por que agora:** só faz sentido medir cliques depois que o redirecionamento já existe; e rate limiting é mais fácil de testar quando os endpoints-alvo já estão prontos.

- Registro de clique a cada redirect (timestamp, código do link)
- Endpoint de analytics agregando cliques por link (e por dia, se possível)
- Rate limiting via Redis nos endpoints de criação de link e de redirect

**Critério de saída da fase:** cliques são contabilizados corretamente, o endpoint de analytics reflete os dados reais, e requisições em excesso retornam erro 429.

---

### Fase 5 — Qualidade
**Objetivo:** garantir que o que foi construído está correto e continuará correto conforme o projeto evolui.
**Por que agora:** testar desde o início do desenvolvimento é ideal, mas nesta fase o foco é fechar a cobertura dos fluxos principais e formalizar o pipeline de verificação automática.

- Testes unitários dos services (regras de negócio isoladas)
- Testes e2e dos fluxos principais (criar link, redirecionar, autenticar)
- Pipeline de CI no GitHub Actions: install → lint → typecheck → testes → build, rodando em cada Pull Request

**Critério de saída da fase:** PR não pode ser mergeado se lint, typecheck, testes ou build falharem.

---

### Fase 6 — Deploy e Documentação
**Objetivo:** deixar o projeto pronto para ser executado e entendido por qualquer pessoa, incluindo em produção.
**Por que por último:** só faz sentido documentar e publicar depois que o comportamento do sistema está estável.

- Dockerfile de produção (multi-stage build, imagem enxuta)
- Pipeline de CD (deploy automático após merge na branch principal)
- Documentação final: `README.md`, `.env.example`, instruções de setup, teste e deploy

**Critério de saída da fase (Definition of Done do MVP):**
- Aplicação funcional, fluxo principal funcionando de ponta a ponta
- Banco configurado, autenticação segura
- Testes essenciais passando
- Docker funcional localmente
- CI funcionando, README completo, variáveis de ambiente documentadas
- Nenhum segredo versionado no repositório

---

## 7. Como Usar Este Documento

Se você está retomando este projeto ou desenvolvendo a partir daqui:

1. Leia a seção 2 (Escopo do MVP) antes de adicionar qualquer funcionalidade nova — se não estiver lá, avalie se é `POST-MVP` antes de implementar.
2. Siga as fases na ordem descrita na seção 6 — cada uma depende do que foi entregue na anterior.
3. Use a seção 5 (Arquitetura) como referência de onde cada nova regra de negócio deve morar.
4. Ao final de cada fase, valide contra o "Critério de saída da fase" antes de seguir para a próxima.
