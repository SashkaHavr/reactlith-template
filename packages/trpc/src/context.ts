export function createContext({ request }: { request: Request }) {
  return { request };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
