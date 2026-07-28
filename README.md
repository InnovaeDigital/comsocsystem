# System of ComSoc

Sistema de monitoramento da Com Soc B Adm QGEx, separado em frontend e backend.

- `frontend/`: React + Vite publicado no Cloudflare Pages.
- `backend/`: API Express publicada como Cloudflare Worker.
- `backend/migrations/`: migrations legadas do banco PostgreSQL/CockroachDB.

O projeto nao usa API de IA e nao depende de PostgreSQL local via Docker.

## URLs de producao

- Frontend: `https://comsoc.pages.dev`
- Backend: `https://comsoc-backend.innovaedigital-media.workers.dev`
- Health check: `https://comsoc-backend.innovaedigital-media.workers.dev/api/health`

## Rodar localmente

1. Instale as dependencias:

```bash
npm install
```

2. Configure o backend em `backend/.env`:

```env
PORT=3001
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,https://comsoc.pages.dev,https://*.comsoc.pages.dev
JSONBIN_BIN_ID=seu_bin_id
JSONBIN_API_KEY=sua_chave_master_ou_access_key
JSONBIN_ACCESS_KEY=opcional_se_voce_criou_uma_access_key
JSONBIN_CACHE_TTL_MS=5000
```

3. Configure o frontend em `frontend/.env`:

```env
VITE_API_URL=
VITE_API_PROXY_TARGET=http://localhost:3001
```

4. Inicie frontend e backend:

```bash
npm run dev
```

URLs locais:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001/api/health`

## Cloudflare

O frontend usa a variavel `VITE_API_URL` no Cloudflare Pages:

```env
VITE_API_URL=https://comsoc-backend.innovaedigital-media.workers.dev
```

O backend agora usa somente JSONBin como persistência. Não há banco PostgreSQL, CockroachDB ou Google Sheets no fluxo de dados.

## Deploy

Backend:

```bash
npm run deploy:cloudflare --workspace backend
```

Frontend:

```bash
npm run deploy:frontend
```

Depois do deploy, valide:

```bash
curl https://comsoc-backend.innovaedigital-media.workers.dev/api/health
```

## Banco de Dados

O sistema usa um único bin JSON com estas chaves:

- `users`
- `categories`
- `notes`
- `chatMessages`
- `activities`
- `presence`
- `remainingOrders`

Crie um bin no dashboard do JSONBin, salve o `BIN_ID` em `JSONBIN_BIN_ID` e use uma API key com permissão de leitura e escrita.

## Qualidade

Antes de publicar, rode:

```bash
npm run lint --workspaces --if-present
npm run test --workspaces --if-present
npm run build
```

## Scripts uteis

```bash
npm run dev              # backend + frontend
npm run dev:backend      # somente backend local
npm run dev:frontend     # somente frontend local
npm run setup:google-sheets --workspace backend  # legado; mantenho apenas para compatibilidade histórica
npm run lint             # valida backend/frontend
npm run test             # executa testes
npm run build            # gera frontend/dist
npm run deploy:frontend  # build + deploy Pages
```
