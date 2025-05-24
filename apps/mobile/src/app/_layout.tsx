import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '~/lib/trpc';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack />
    </QueryClientProvider>
  );
}
