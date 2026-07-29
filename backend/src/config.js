export const config = {
  port: Number(process.env.PORT || 3001),
  corsOrigin:
    process.env.CORS_ORIGIN ||
    'http://localhost:5173,http://127.0.0.1:5173,https://comsoc.pages.dev,https://*.comsoc.pages.dev',
};
