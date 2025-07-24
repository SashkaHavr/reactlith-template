import {
  ErrorComponent as DefaultErrorComponent,
  Link,
} from '@tanstack/react-router';

import { Button } from './ui/button';

export function ErrorComponent({ error }: { error: Error }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 pb-20">
      <p className="text-lg font-semibold">Something went wrong</p>
      {import.meta.env.DEV && <DefaultErrorComponent error={error} />}
      <Button asChild variant="link">
        <Link to="/{-$locale}">Return to Home page</Link>
      </Button>
    </div>
  );
}
