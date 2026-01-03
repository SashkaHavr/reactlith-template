import { auth } from "#index.ts";
import { db } from "@reactlith-template/db";
import { envAuth } from "@reactlith-template/env/auth";

async function main() {
  if (!envAuth.TEST_AUTH) {
    return;
  }

  const user = await db.query.user.findFirst({
    where: { email: { like: "%@example.com" } },
  });
  if (user) {
    console.log("Test users already exist. Skipping generation.");
    return;
  }

  await Promise.all(
    Array.from(Array(100).keys()).map((user) =>
      auth.api
        .createUser({
          body: {
            email: `user${user}@example.com`,
            password: `password${user}`,
            name: `Test User ${user}`,
          },
        })
        .catch(() => {
          /* user already exists */
        })
    )
  );
}

await main();
