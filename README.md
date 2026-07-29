# System of ComSoc

Sistema de monitoramento da Com Soc B Adm QGEx, preparado para deploy no Vercel.

## Estrutura

- `frontend/`: app React + Vite
- `backend/`: API Express usada pela função serverless do Vercel
- `api/index.js`: entrada da API no Vercel

## Rodar localmente

1. Instale as dependências:

```bash
npm install
```

2. Configure o backend em `backend/.env`:

```env
PORT=3001
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
JSONBIN_BIN_ID=seu_bin_id
JSONBIN_API_KEY=sua_chave_master_ou_access_key
JSONBIN_ACCESS_KEY=opcional_se_voce_criou_uma_access_key
JSONBIN_CACHE_TTL_MS=5000
```

3. Configure o frontend em `frontend/.env`:

```env
VITE_API_PROXY_TARGET=http://localhost:3001
```

4. O backend agora carrega automaticamente a pasta `banco de dados migração` quando o JSONBin não está configurado ou falha.

5. Inicie o projeto:

```bash
npm run dev
```

## Vercel

- A API é publicada por `api/index.js`
- O frontend é gerado em `frontend/dist`
- O frontend chama `/api` por padrão no mesmo domínio

## Deploy

1. Envie o repositório para o GitHub
2. Importe o projeto no Vercel
3. Configure as variáveis de ambiente no Vercel:
   - `JSONBIN_BIN_ID`
   - `JSONBIN_API_KEY` ou `JSONBIN_ACCESS_KEY`
   - `JSONBIN_CACHE_TTL_MS` opcional
   - `CORS_ORIGIN` com a URL final do seu domínio, se quiser restringir a API
4. Faça o deploy

## Fluxo recomendado

1. Suba o código para um repositório no GitHub
2. Conecte esse repositório ao Vercel
3. Defina as variáveis acima no painel do Vercel
4. Faça um deploy de produção
5. Abra o site em aba anônima e valide login, leitura da base migrada e criação de novos registros

## Qualidade

```bash
npm run lint --workspaces --if-present
npm run test --workspaces --if-present
npm run build
```
