import Link from "next/link";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ag-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#867dfc" />
          <stop offset="1" stopColor="#4d33d6" />
        </linearGradient>
      </defs>
      <path
        d="M20 2.5 5 8.2v9.3c0 9.1 6.1 17.6 15 20.2 8.9-2.6 15-11.1 15-20.2V8.2L20 2.5Z"
        fill="url(#ag-grad)"
      />
      {/* keyhole — secure knowledge */}
      <circle cx="20" cy="17.5" r="3.4" fill="#fff" />
      <path d="M18.4 19.5h3.2l1 7.2h-5.2l1-7.2Z" fill="#fff" />
    </svg>
  );
}

export function Logo({
  className = "",
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-ink-900 ${className}`}
    >
      <LogoMark />
      <span>Aegis</span>
    </Link>
  );
}
