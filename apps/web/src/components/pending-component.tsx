import { isMatch, useRouterState } from '@tanstack/react-router';

import { LoadingSpinner } from './ui/loading';

export function PendingComponent() {
  const matches = useRouterState({ select: (s) => s.matches }).filter((m) =>
    isMatch(m, 'context.loadingText'),
  );
  const loadingText = matches[0]?.context.loadingText;

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-1 pb-20">
      <LoadingSpinner />
      {loadingText && <p className="text-lg">{loadingText}</p>}
    </div>
  );
}
