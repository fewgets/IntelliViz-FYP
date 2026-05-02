'use client';

interface Layout8020Props {
  left: React.ReactNode;
  right: React.ReactNode;
  rightWidth?: string;
  className?: string;
  minHeight?: string;
}

export function Layout8020({
  left,
  right,
  rightWidth = '20%',
  className = '',
  minHeight = 'h-screen',
}: Layout8020Props) {
  const leftWidth = `calc(100% - ${rightWidth})`;

  return (
    <div className={`flex flex-col lg:flex-row ${minHeight} ${className}`}>
      <div
        style={{ '--lg-width': leftWidth } as React.CSSProperties}
        className="w-full lg:w-[var(--lg-width)] overflow-visible lg:overflow-hidden"
      >
        {left}
      </div>
      <div
        style={{ '--lg-width': rightWidth } as React.CSSProperties}
        className="w-full lg:w-[var(--lg-width)] border-t lg:border-t-0 lg:border-l border-blue-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-900 overflow-visible lg:overflow-hidden flex flex-col lg:h-full"
      >
        {right}
      </div>
    </div>
  );
}
