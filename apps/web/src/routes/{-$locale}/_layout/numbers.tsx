import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useTranslations } from 'use-intl';

import { Button } from '~/components/ui/button';

import { authClient, useResetAuth } from '~/lib/auth';
import { useLoggedInAuth } from '~/lib/route-context-hooks';
import { useTRPC } from '~/lib/trpc';
import { getNumbersServerFn } from '~/lib/trpc-server';

export const Route = createFileRoute('/{-$locale}/_layout/numbers')({
  beforeLoad: ({ context: { auth } }) => {
    if (!auth.loggedIn) {
      throw redirect({ to: '/{-$locale}' });
    }
  },
  loader: async ({ context: { queryClient, trpc } }) => {
    await queryClient.ensureQueryData({
      queryKey: trpc.numbers.getAll.queryKey(),
      queryFn: getNumbersServerFn,
    });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const t = useTranslations('index');
  const queryClient = useQueryClient();

  const auth = useLoggedInAuth();
  const resetAuth = useResetAuth();

  const numbers = useSuspenseQuery(trpc.numbers.getAll.queryOptions());

  const invalidateNumbers = async () => {
    await queryClient.invalidateQueries({
      queryKey: trpc.numbers.getAll.queryKey(),
    });
  };
  const addNumber = useMutation(
    trpc.numbers.addNew.mutationOptions({
      onSuccess: () => invalidateNumbers(),
    }),
  );
  const deleteNumbers = useMutation(
    trpc.numbers.deleteAll.mutationOptions({
      onSuccess: () => invalidateNumbers(),
    }),
  );
  const signout = useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: async () => {
      await resetAuth();
    },
  });
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <p>
          {t('user')}: {auth.user.email}
        </p>
        <Button variant="outline" onClick={() => signout.mutate()}>
          {t('logout')}
        </Button>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => addNumber.mutate()}>
          {t('add-number')}
        </Button>
        <Button variant="outline" onClick={() => deleteNumbers.mutate()}>
          {t('delete-all-numbers')}
        </Button>
      </div>
      <p className="text-xl font-bold">{JSON.stringify(numbers.data)}</p>
    </div>
  );
}
