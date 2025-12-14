import { drizzle } from 'drizzle-orm/bun-sql';

import { envDB } from '@reactlith-template/env/db';

import { relations } from '#relations.ts';
import * as schema from './schema';

export const db = drizzle({
  connection: {
    url: envDB.DATABASE_URL,
  },
  schema: schema,
  relations: relations,
  casing: 'snake_case',
});
