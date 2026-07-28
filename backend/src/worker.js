import { env } from 'cloudflare:workers';
import { httpServerHandler } from 'cloudflare:node';

globalThis.__COMSOC_WORKER_RUNTIME__ = true;

const { createApp } = await import('./app.js');
const app = createApp({
  runtimeMiddleware: (_req, _res, next) => {
    globalThis.__COMSOC_JSONBIN_BIN_ID__ = env.JSONBIN_BIN_ID || '';
    globalThis.__COMSOC_JSONBIN_API_KEY__ = env.JSONBIN_API_KEY || '';
    globalThis.__COMSOC_JSONBIN_ACCESS_KEY__ = env.JSONBIN_ACCESS_KEY || '';

    next();
  },
});

app.listen(3000);

export default httpServerHandler({ port: 3000 });
