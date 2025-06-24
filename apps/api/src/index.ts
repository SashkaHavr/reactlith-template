import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { auth } from '@reactlith-template/auth';
import { envServer } from '@reactlith-template/env/server';
import { trpcHandler } from '@reactlith-template/trpc';

const app = new Hono();

app.use(
  '/auth/*',
  cors({
    origin: envServer.AUTH_TRUSTED_ORIGINS,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  }),
);
app.use(
  '/trpc/*',
  cors({
    origin: envServer.AUTH_TRUSTED_ORIGINS,
    maxAge: 600,
    credentials: true,
  }),
);

app.on(['POST', 'GET'], '/auth/*', (c) => {
  return auth.handler(c.req.raw);
});

app.on(['POST', 'GET'], '/trpc/*', (c) => {
  return trpcHandler({ request: c.req.raw });
});

export default {
  port: 3000,
  fetch: app.fetch,
};
