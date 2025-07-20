import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useTranslations } from 'use-intl';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';

import { authClient } from '~/lib/auth';
import { useTRPC } from '~/lib/trpc';

export const Route = createFileRoute('/{-$locale}/_layout/')({
  beforeLoad: ({ context: { auth } }) => {
    if (auth.loggedIn) {
      throw redirect({ to: '/{-$locale}/numbers' });
    }
  },
  component: RouteComponent,
});
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>GitHub</title>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function RouteComponent() {
  const trpc = useTRPC();
  const t = useTranslations('index');
  const authConfig = useQuery(trpc.config.authConfig.queryOptions());

  const githubSignin = useMutation({
    mutationFn: () =>
      authClient.signIn.social({
        provider: 'github',
        callbackURL: window.origin,
      }),
  });
  const magicLinkSignin = useMutation({
    mutationFn: () =>
      authClient.signIn.magicLink({
        email: email,
        callbackURL: window.origin,
      }),
    onSuccess: () => setShowLoginHint(true),
  });

  const [email, setEmail] = useState('');
  const [showLoginHint, setShowLoginHint] = useState(false);

  return (
    authConfig.isSuccess && (
      <div className="flex flex-col gap-3">
        {authConfig.data.githubOAuth && (
          <Button variant="outline" onClick={() => githubSignin.mutate()}>
            {t('login-with-github')}
            <GitHubIcon className="size-5" />
          </Button>
        )}
        {authConfig.data.githubOAuth && authConfig.data.devMagicLink && (
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2">
              {t('or-continue-with-dev-magic-link')}
            </span>
          </div>
        )}
        {authConfig.data.devMagicLink && (
          <>
            <div className="flex gap-2">
              <Input
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                variant="outline"
                onClick={() => magicLinkSignin.mutate()}
              >
                {t('login')}
              </Button>
            </div>
            {showLoginHint && (
              <p className="self-center text-sm text-foreground/70">
                {t('see-your-backend-server-terminal')}
              </p>
            )}
          </>
        )}
      </div>
    )
  );
}
