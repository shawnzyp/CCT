import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        style: {
          background: 'var(--cc-panel0, #1A1F26)',
          border: '1px solid color-mix(in srgb, var(--cc-accent-a, #00E5FF) 22%, transparent)',
          color: 'var(--cc-text0, #E6F1FF)',
          fontFamily: 'monospace',
          fontSize: '0.8rem',
          letterSpacing: '0.04em',
          boxShadow: 'var(--cc-glow, 0 0 12px rgba(0,229,255,0.2))',
        },
        classNames: {
          description: 'opacity-75',
          actionButton: 'font-mono text-xs',
          cancelButton: 'font-mono text-xs',
          success: 'border-[var(--cc-success)] text-[var(--cc-success)]',
          error: 'border-[var(--cc-danger)] text-[var(--cc-danger)]',
          warning: 'border-[var(--cc-warning)] text-[var(--cc-warning)]',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };