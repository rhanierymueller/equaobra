interface SectionLabelProps {
  children: React.ReactNode
  className?: string
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <p
      className={`text-xs font-semibold uppercase tracking-widest mb-3 ${className ?? ''}`}
      style={{ color: 'var(--color-text-dim)' }}
    >
      {children}
    </p>
  )
}
