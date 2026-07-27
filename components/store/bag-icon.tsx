import type { SVGProps } from "react";

export function BagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
      <path d="M7.5 11.5h17l-1 15h-15l-1-15Z" stroke="currentColor" strokeWidth="1.25" />
      <path d="M11.5 13V9a4.5 4.5 0 0 1 9 0v4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M10 18.5c3.8 2 8.2 2 12 0" stroke="currentColor" strokeWidth=".9" opacity=".45" />
    </svg>
  );
}

