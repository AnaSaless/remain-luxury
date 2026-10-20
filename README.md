# Remain Luxury (ModaLuxo)

Marketplace brasileiro de moda de luxo de segunda mão. Quem tem uma bolsa, um sapato ou um acessório de grife parado no armário anuncia a peça, e quem quer comprar conversa direto com o vendedor, vê a reputação dele e fecha o pedido, tudo em um só lugar.

Projeto acadêmico da disciplina **Experiência Criativa** (PUCPR, 2026/1). "Remain Luxury" é o nome da marca e "ModaLuxo" é o nome usado no código e no banco de dados (`modaluxo`).

## Integrantes

- Ana Carolina Afonso Meiado
- Ana Carolina Curi de Sales
- Anna Navarro

## O que o sistema faz

**Para quem compra**
- Catálogo com busca por texto e filtros de categoria, marca, condição e faixa de preço, com ordenação por menor ou maior preço
- Página da peça com fotos, detalhes e sugestões de peças relacionadas
- Favoritos e carrinho de compras
- Checkout com endereço de entrega e histórico de pedidos (o sistema impede comprar a própria peça)
- Chat direto com o vendedor antes da compra
- Avaliação dos vendedores

**Para quem vende**
- Cadastro de peças com até 5 fotos (JPEG, PNG ou WEBP, até 5 MB cada), edição e exclusão
- Perfil público com anúncios, avaliações e estatísticas (anúncios, vendas e nota média)
- Pedido de verificação de vendedor, que dá direito ao selo de confiança

**Geral**
- Cadastro, login com JWT e exclusão de conta
- Tema claro e escuro
- Rotas protegidas e validação de formulários no front e no back

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router 7, Zustand, React Hook Form + Zod, Axios, date-fns |
| Backend | Node.js, Express 5, MySQL 8 (mysql2), JWT, bcryptjs, Multer, CORS, dotenv |
| Qualidade | ESLint e Prettier no frontend |

## Estrutura do repositório

```
.
├── Apresentação/       Slides do pitch (Astra (1).pptx)
├── Código Front/       Aplicação React (Vite)
├── Código Back/        API REST (Express)
│   └── src/
│       ├── controllers/   regras de negócio de cada recurso
│       ├── routes/        definição dos endpoints
│       ├── middlewares/   autenticação (JWT) e validação de ids
│       ├── config/        conexão com o MySQL
│       └── uploads/       imagens enviadas pelos usuários
├── Esquema do Banco/   modaluxo_completo.sql (estrutura + dados de exemplo)
└── README.md
```

## Como rodar localmente

### Pré-requisitos

- Node.js 20.19 ou superior (exigência do Vite 8)
- MySQL 8.0

### 1. Banco de dados

Abra o MySQL Workbench (ou o terminal do MySQL) e execute o arquivo `Esquema do Banco/modaluxo_completo.sql`. Ele cria o banco `modaluxo`, as 9 tabelas e insere dados de exemplo.

### 2. Backend

```bash
cd "Código Back"
cp .env.example .env      # no PowerShell: Copy-Item .env.example .env
npm install
npm run dev
```

Abra o `.env` e preencha:

| Variável | Valor |
|---|---|
| `DB_PASSWORD` | senha do seu MySQL local |
| `JWT_SECRET` | qualquer texto longo e difícil de adivinhar |

O restante (`DB_HOST`, `DB_USER`, `DB_NAME`, `JWT_EXPIRES_IN`, `PORT`) já vem com valores padrão. A API sobe em `http://localhost:8000`, e `GET /api/health` responde `{ "status": "ok" }` quando está tudo certo.

### 3. Frontend

```bash
cd "Código Front"
cp .env.example .env      # no PowerShell: Copy-Item .env.example .env
npm install
npm run dev
```

O site abre em `http://localhost:3000`.

> Suba o banco primeiro, depois o backend e por último o frontend. Backend e frontend precisam ficar rodando ao mesmo tempo, cada um no seu terminal. A API só aceita requisições vindas de `http://localhost:3000`.

### Contas de teste

Todas as contas abaixo vêm no banco de exemplo, com a senha `12345678`.

| E-mail | Perfil |
|---|---|
| isabela@modaluxo.com | vendedora |
| fernanda@modaluxo.com | vendedora |
| carolina@modaluxo.com | vendedora |

## API

Base: `http://localhost:8000/api`. As rotas marcadas com 🔒 exigem o cabeçalho `Authorization: Bearer <token>`.

| Recurso | Endpoints |
|---|---|
| Autenticação | `POST /auth/register`, `POST /auth/login`, 🔒 `GET /auth/me`, 🔒 `POST /auth/request-verification`, `PUT /auth/:id/verify` |
| Produtos | `GET /products` (filtros: `categoria`, `marca`, `condicao`, `q`, `minPrice`, `maxPrice`, `orderBy`), `GET /products/featured`, `GET /products/:id`, `GET /products/:id/related`, `GET /products/user/:userId`, 🔒 `POST /products`, 🔒 `PUT /products/:id`, 🔒 `DELETE /products/:id` |
| Favoritos | 🔒 `GET /favorites`, 🔒 `GET /favorites/:productId/check`, 🔒 `POST /favorites/:productId`, 🔒 `DELETE /favorites/:productId` |
| Pedidos | 🔒 `POST /orders`, 🔒 `GET /orders`, 🔒 `GET /orders/:id` |
| Avaliações | `GET /reviews/seller/:sellerId`, 🔒 `POST /reviews`, 🔒 `PUT /reviews/:id`, 🔒 `DELETE /reviews/:id` |
| Conversas | 🔒 `POST /conversations`, 🔒 `GET /conversations`, 🔒 `GET /conversations/:id/messages`, 🔒 `POST /conversations/:id/messages` |
| Usuários | `GET /users/:id` (perfil público), 🔒 `DELETE /users/me` |

## Banco de dados

Nove tabelas: `users`, `products`, `product_images`, `favorites`, `orders`, `order_items`, `reviews`, `conversations` e `messages`. A estrutura completa, com chaves e relacionamentos, está em `Esquema do Banco/modaluxo_completo.sql`.

## Limitações conhecidas

- O pagamento é simulado: o pedido é registrado como confirmado no checkout, sem integração com gateway de pagamento.
- O chat funciona por requisições à API (o usuário vê as mensagens ao abrir ou atualizar a conversa), sem WebSocket.
- A aprovação do selo de vendedor é feita direto pela rota da API (`PUT /auth/:id/verify`), sem painel de administração e sem controle de acesso. Para uso real, essa rota precisa ser restrita a administradores.

## Apresentação

O pitch do projeto está na pasta `Apresentação/`.
