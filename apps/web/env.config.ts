import { defineConfig } from '@julr/vite-plugin-validate-env';
import { z } from 'zod/v4';

export default defineConfig({
  validator: 'zod',
  schema: {
    VITE_API_URL: z.union([z.url()]).default('http://localhost:3000'),
  },
});
