'use client'

import { ToastProvider } from '@/src/components/Toast'
import { UserProvider } from '@/src/contexts/UserContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ToastProvider>{children}</ToastProvider>
    </UserProvider>
  )
}
