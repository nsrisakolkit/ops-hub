'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,        // Data fresh for 1 minute
        retry: 1,                    // Retry failed requests once
        refetchOnWindowFocus: false, // Don't refetch on window focus
      },
      mutations: {
        retry: false,                // Don't retry failed mutations
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}