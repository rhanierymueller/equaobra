'use client'

import dynamic from 'next/dynamic'

function HomeSkeleton() {
  return (
    <div className="flex flex-col h-screen" style={{ background: '#0D0C0B' }}>
      {/* Navbar placeholder */}
      <div className="h-14 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(13,12,11,0.92)' }} />
      {/* Body */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full animate-spin"
            style={{ border: '3px solid rgba(224,123,42,0.2)', borderTopColor: '#E07B2A' }}
          />
          <span className="text-sm" style={{ color: 'rgba(245,240,235,0.4)' }}>Carregando...</span>
        </div>
      </div>
    </div>
  )
}

const HomeSearch = dynamic(
  () => import('@/src/features/professional/pages/HomeSearch'),
  { ssr: false, loading: () => <HomeSkeleton /> },
)

export default function HomeClient() {
  return <HomeSearch />
}
