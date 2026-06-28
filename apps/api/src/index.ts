Bun.serve({
  port: 3000,
  async fetch() {
    const res = await fetch("http://emulate.localhost", { method: "POST" });
    console.log(await res.json());
    return new Response("Hello world!");
  },
});
