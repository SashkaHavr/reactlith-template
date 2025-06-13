import { defineConfig } from '@julr/vite-plugin-validate-env';
import { z } from 'zod/v4';

export default defineConfig({
  validator: 'standard',
  schema: {
    VITE_API_URL: z
      .union([z.url(), z.literal('')])
      .optional()
      .default('http://localhost:3000'),
    VITE_API_REVERSE_PROXY_PATH: z
      .string()
      .optional()
      .transform((path) =>
        path == undefined ? undefined : '/' + path.replaceAll('/', ''),
      ),
  },
});
