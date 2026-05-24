'use client';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export default function EmptyState({ icon = '○', title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center px-4">
      <span className="text-2xl text-slate-600">{icon}</span>
      <p className="text-sm text-slate-400">{title}</p>
      {description && <p className="text-xs text-slate-600">{description}</p>}
    </div>
  );
}
