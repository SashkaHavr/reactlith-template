import { useState } from 'react';
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

function TestInput({
  type,
  placeholder,
  value,
  onValueChange,
}: {
  type: 'otp' | 'email';
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      type={type == 'otp' ? 'text' : type}
      pattern={type == 'otp' ? '\\d*' : undefined}
      placeholder={placeholder}
      className="border border-black px-4 py-2 transition-colors"
    />
  );
}

function RouteComponent() {
  const queryClient = useQueryClient();
  const authConfig = useQuery(trpc.config.authConfig.queryOptions());
  const devOTP = authConfig.isSuccess && authConfig.data.devOTP;
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
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  return (
    <div className="flex w-full flex-col items-center gap-2 pt-20">
      <p>Works!</p>
      {devOTP &&
        !session.data &&
        (showOTPInput ? (
          <div className="flex gap-2">
            <TestInput
              type="otp"
              placeholder="123456"
              value={otp}
              onValueChange={setOtp}
            />
            <TestButton
              onClick={() => {
                void authClient.signIn.emailOtp({
                  email: email,
                  otp: otp,
                });
                setShowOTPInput(false);
                setOtp('');
                setEmail('');
              }}
            >
              Login
            </TestButton>
          </div>
        ) : (
          <div className="flex gap-2">
            <TestInput
              type="email"
              placeholder="user@example.com"
              value={email}
              onValueChange={setEmail}
            />
            <TestButton
              onClick={() => {
                void authClient.emailOtp.sendVerificationOtp({
                  email: email,
                  type: 'sign-in',
                });
                setShowOTPInput(true);
              }}
            >
              Send code
            </TestButton>
          </div>
        ))}
      {session.data && (
        <TestButton
          onClick={() => {
            void authClient.signOut();
            void queryClient.clear();
          }}
        >
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
