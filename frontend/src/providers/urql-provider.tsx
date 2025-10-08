'use client'

import { Client, Provider, cacheExchange, fetchExchange } from 'urql'

const client = new Client({
  url: '/api/gql',
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
})

export function UrqlProvider({ children }: { children: React.ReactNode }) {
  return <Provider value={client}>{children}</Provider>
}