/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/// <reference types="vite/client" />

type ImportMetaEnvAugmented =
  import('@julr/vite-plugin-validate-env').ImportMetaEnvAugmented<
    typeof import('../env.config').default
  >;

interface ImportMetaEnv extends ImportMetaEnvAugmented {}
