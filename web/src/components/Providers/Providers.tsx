'use client'

import { UserProvider } from '@/src/contexts/UserContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>
}
