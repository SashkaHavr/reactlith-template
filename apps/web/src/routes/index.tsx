import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { authClient } from '~/lib/auth';
import { trpc } from '~/lib/trpc';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function TestButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className="border border-black px-4 py-2 transition-colors hover:bg-gray-200"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function RouteComponent() {
  const queryClient = useQueryClient();
  const authConfig = useQuery(trpc.config.authConfig.queryOptions());
  const devMagicLink = authConfig.isSuccess && authConfig.data.devMagicLink;
  const session = authClient.useSession();
  const numbers = useQuery(
    trpc.numbers.getAll.queryOptions(session.data ? void 0 : skipToken),
  );
  const addNumber = useMutation(
    trpc.numbers.addNew.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: trpc.numbers.getAll.queryKey(),
        }),
    }),
  );
  const deleteNumbers = useMutation(
    trpc.numbers.deleteAll.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: trpc.numbers.getAll.queryKey(),
        }),
    }),
  );

  return (
    <div className="flex w-full flex-col items-center gap-2 pt-20">
      <p>Works!</p>
      {devMagicLink && !session.data && (
        <TestButton
          onClick={() =>
            void authClient.signIn.magicLink({
              email: 'test@example.com',
              callbackURL: window.location.href,
            })
          }
        >
          Login
        </TestButton>
      )}
      {session.data && (
        <TestButton onClick={() => void authClient.signOut()}>
          Logout
        </TestButton>
      )}
      {session.data && <p>User: {session.data.user.email}</p>}
      {session.data && (
        <div className="flex gap-2">
          <TestButton onClick={() => addNumber.mutate()}>Add number</TestButton>
          <TestButton onClick={() => deleteNumbers.mutate()}>
            Delete all numbers
          </TestButton>
        </div>
      )}
      {numbers.isSuccess && (
        <p className="text-xl font-bold">{JSON.stringify(numbers.data)}</p>
      )}
    </div>
  );
}
