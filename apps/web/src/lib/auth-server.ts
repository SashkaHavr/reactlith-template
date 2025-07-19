import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';

import { auth } from '@reactlith-template/auth';

export const getSessionServerFn = createServerFn().handler(() => {
  return auth.api.getSession({ headers: getWebRequest().headers });
});
