import 'dotenv/config';
import { config } from './config.js';
import { pool } from './db/sheets.js';
import { createApp } from './app.js';

globalThis.__COMSOC_JSONBIN_BIN_ID__ = process.env.JSONBIN_BIN_ID || '';
globalThis.__COMSOC_JSONBIN_API_KEY__ = process.env.JSONBIN_API_KEY || '';
globalThis.__COMSOC_JSONBIN_ACCESS_KEY__ = process.env.JSONBIN_ACCESS_KEY || '';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`Backend ComSoc ativo em http://localhost:${config.port}`);
});

function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
