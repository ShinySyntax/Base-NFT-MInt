"use client";

import React from 'react';

import { ThirdwebProvider } from 'thirdweb/react';
import { WagmiProvider } from 'wagmi';

import { config } from '@/lib/config';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ThirdwebProvider as ThirdwebProviderV4 } from '@thirdweb-dev/react';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProviderV4>
        <ThirdwebProvider>
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </WagmiProvider>
        </ThirdwebProvider>
      </ThirdwebProviderV4>
  );
}
