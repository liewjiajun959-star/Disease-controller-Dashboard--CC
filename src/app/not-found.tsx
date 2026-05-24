import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#0a0e1a] text-slate-200 gap-4">
      <div className="text-6xl font-mono text-cyan-400">404</div>
      <div className="text-slate-400">Page not found</div>
      <Link
        href="/"
        className="mt-4 px-4 py-2 rounded border border-cyan-500/30 text-cyan-400 text-sm hover:bg-cyan-500/10 transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
