export function InputField({ style, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        background: 'var(--color-border-subtle)',
        border: '1px solid var(--color-border-faint)',
        color: 'var(--color-text)',
        borderRadius: 10,
        padding: '9px 12px',
        fontSize: 13,
        outline: 'none',
        ...style,
      }}
    />
  )
}
