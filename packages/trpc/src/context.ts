import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export function createContext({ opts }: { opts: FetchCreateContextFnOptions }) {
  return { request: opts.req };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
