"use client";

import React from 'react';

import { ThirdwebProvider } from 'thirdweb/react';
import { WagmiProvider } from 'wagmi';

import { config } from '@/lib/config';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
      <ThirdwebProvider {...({ clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID } as any)}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      </ThirdwebProvider>
  );
}
