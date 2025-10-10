'use client';

import { useQuery } from '@tanstack/react-query';
import type { UserProfile } from '@/types/api';

async function fetchCurrentUser(): Promise<UserProfile | null> {
  const response = await fetch('/api/auth/me', {
    credentials: 'include',
  });

  const data = await response.json().catch(() => null);

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(data?.message ?? 'Failed to load current user');
  }

  return (data as UserProfile) ?? null;
}

export function useCurrentUser() {
  return useQuery<UserProfile | null>({
    queryKey: ['current-user'],
    queryFn: fetchCurrentUser,
    staleTime: 30 * 1000,
  });
}
