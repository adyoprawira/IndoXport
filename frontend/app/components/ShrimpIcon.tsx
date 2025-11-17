"use client";

export default function ShrimpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g fill="#FF7A00">
        <path d="M10 34c2-6 10-10 20-10s18 4 20 10c0 0 2 6-4 8-4 1-6-2-10-3-5-1-8 0-12 0-4 0-7 2-10 2s-6-4-4-7z" />
        <path d="M52 26c1-2 3-4 4-6 1-2 0-4-2-5-2-1-4 0-6 1-1 1-2 2-3 3" opacity="0.9" />
        <circle cx="22" cy="30" r="2" fill="#fff" />
      </g>
    </svg>
  );
}
