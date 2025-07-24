import { Link } from '@tanstack/react-router';

import { Button } from './ui/button';

export function NotFoundComponent() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 pb-20">
      <p className="text-lg font-semibold">
        The page you are looking for does not exist
      </p>
      <Button asChild variant="link">
        <Link to="/{-$locale}">Return to Home page</Link>
      </Button>
    </div>
  );
}
