import { createIsomorphicFn } from "@tanstack/react-start";
import {
  getCookie as getServerCookie,
  setCookie as setServerCookie,
  deleteCookie as deleteServerCookie,
} from "@tanstack/react-start/server";

const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;

export const getCookie = createIsomorphicFn()
  // oxlint-disable-next-line require-await
  .server(async (name: string) => {
    return getServerCookie(name);
  })
  .client(async (name: string) => {
    const cookie = await cookieStore.get({ name });
    return cookie?.value;
  });

export const setCookie = createIsomorphicFn()
  // oxlint-disable-next-line require-await
  .server(async (name: string, value: string, days = 400) => {
    return setServerCookie(name, value, {
      expires: new Date(Date.now() + days * MILLISECONDS_IN_A_DAY),
    });
  })
  .client(async (name: string, value: string, days = 400) => {
    await cookieStore.set({
      name,
      value,
      expires: Date.now() + days * MILLISECONDS_IN_A_DAY,
    });
  });

export const deleteCookie = createIsomorphicFn()
  // oxlint-disable-next-line require-await
  .server(async (name: string) => {
    return deleteServerCookie(name);
  })
  .client(async (name: string) => {
    await cookieStore.delete({ name });
  });
