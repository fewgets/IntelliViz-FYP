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
    <div className={`flex ${minHeight} ${className}`}>
      <div style={{ width: leftWidth }} className="overflow-hidden">
        {left}
      </div>
      <div
        style={{ width: rightWidth }}
        className="border-l border-blue-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-900 overflow-hidden flex flex-col h-full"
      >
        {right}
      </div>
    </div>
  );
}
