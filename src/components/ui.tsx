import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-saffron text-navy-900 hover:bg-[#ffab57] shadow-[0_5px_0_#b3620f]',
  secondary: 'bg-cream text-navy-900 hover:bg-white shadow-[0_5px_0_#b5a77f]',
  ghost: 'bg-navy-700/70 text-cream hover:bg-navy-700 border border-cream/25',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
}

export function Button({ variant = 'secondary', icon, children, className = '', ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-extrabold tracking-wide transition active:translate-y-[2px] disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`dd-pop w-full rounded-3xl border border-cream/20 bg-navy-800/95 p-5 shadow-2xl backdrop-blur sm:p-7 ${className}`}
    >
      {children}
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-navy-900/70 px-3 py-2 text-center">
      <div className="text-[11px] font-bold uppercase tracking-widest text-cream/70">{label}</div>
      <div className="text-xl font-extrabold text-cream sm:text-2xl">{value}</div>
    </div>
  );
}
