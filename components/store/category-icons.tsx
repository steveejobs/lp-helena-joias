import type { SVGProps } from "react";

import type { CategoryIconKey } from "@/types/commerce";

type IconProps = SVGProps<SVGSVGElement> & {
  label?: string;
  simplified?: boolean;
};

function IconShell({
  children,
  label,
  simplified = false,
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      role={label ? "img" : undefined}
      aria-hidden={label ? undefined : true}
      data-simplified={simplified ? "true" : undefined}
      {...props}
    >
      {label ? <title>{label}</title> : null}
      {children}
    </svg>
  );
}

const bodyStroke = {
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 1.35,
};

const jewelStroke = {
  stroke: "var(--category-jewel, #9b7148)",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 2.7,
};

function NecklacesIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M20 96c4-15 14-23 28-27 4-1 7-5 7-10V48" {...bodyStroke} />
      <path d="M100 96c-4-15-14-23-28-27-4-1-7-5-7-10V48" {...bodyStroke} />
      <path d="M46 33c2 9 7 14 14 14s12-5 14-14" {...bodyStroke} />
      <path d="M37 70c3 15 11 25 23 29 12-4 20-14 23-29" {...jewelStroke} />
      <path d="M43 72c4 10 9 16 17 20 8-4 13-10 17-20" {...jewelStroke} opacity=".55" />
      <path d="m60 91 4 6-4 7-4-7 4-6Z" fill="var(--category-rose, #c28e88)" stroke="none" />
      <circle cx="39" cy="70" r="2.1" fill="var(--category-jewel, #9b7148)" />
      <circle cx="81" cy="70" r="2.1" fill="var(--category-jewel, #9b7148)" />
    </IconShell>
  );
}

function EarringsIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M73 20c-18 1-30 14-30 34 0 11 4 18 10 24 5 5 6 11 3 20" {...bodyStroke} />
      <path d="M72 34c8 5 11 12 9 20-2 8-8 11-13 8-5-3-5-10-1-13 3-3 7-1 8 2" {...bodyStroke} />
      <path d="M43 54c-6 2-11 6-14 12" {...bodyStroke} />
      <path d="M50 39c-8-1-14-5-17-12" {...bodyStroke} />
      <circle cx="68" cy="63" r="3.1" fill="var(--category-rose, #c28e88)" />
      <path d="M68 66c-8 8-9 17-2 27 2 3 5 6 7 8 5-8 7-16 3-24-2-5-5-8-8-11Z" {...jewelStroke} />
      <path d="M68 73c4 6 5 13 3 21" {...jewelStroke} opacity=".5" />
      <path d="M55 102c9 4 18 4 27 0" {...bodyStroke} />
    </IconShell>
  );
}

function BraceletsIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M19 86c15-7 24-15 31-25 5-8 10-16 17-23 3-3 7-2 8 2 1 3-1 7-4 10" {...bodyStroke} />
      <path d="M70 50c4-7 8-15 12-22 2-4 7-3 8 1 1 3-1 7-3 10l-8 16" {...bodyStroke} />
      <path d="M79 55 91 37c3-4 8-1 7 4-1 3-3 6-5 9L82 66" {...bodyStroke} />
      <path d="m82 66 10-11c4-4 9 0 6 5-6 10-12 18-19 25-7 7-12 13-15 22" {...bodyStroke} />
      <path d="M32 76c8 2 16 7 22 14" {...bodyStroke} />
      <path d="M43 66c9 2 18 8 24 16" {...jewelStroke} />
      <path d="M39 71c9 2 17 7 24 16" {...jewelStroke} opacity=".55" />
      {[0, 1, 2, 3, 4].map((item) => (
        <circle
          key={item}
          cx={44 + item * 5}
          cy={70 + item * 3.7}
          r="2.2"
          fill={item % 2 ? "var(--category-rose, #c28e88)" : "var(--category-jewel, #9b7148)"}
        />
      ))}
    </IconShell>
  );
}

function RingsIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M25 86c8-4 14-10 18-18l11-27c2-5 8-5 10-1 1 2 0 5-1 8l-4 12" {...bodyStroke} />
      <path d="m59 60 9-30c2-5 8-5 10 0 1 2 0 5-1 8l-7 27" {...bodyStroke} />
      <path d="m70 65 8-26c2-5 8-4 9 1 1 3-1 8-2 12l-5 21" {...bodyStroke} />
      <path d="m80 73 6-16c2-5 8-3 8 2 0 4-3 13-5 18-4 11-11 18-20 23" {...bodyStroke} />
      <path d="M31 79c10 4 18 10 24 20" {...bodyStroke} />
      <ellipse cx="70" cy="50" rx="8" ry="4.5" {...jewelStroke} />
      <path d="M64 48c0-7 3-12 6-12s6 5 6 12" {...jewelStroke} />
      <path d="m70 30 5 5-5 7-5-7 5-5Z" fill="var(--category-rose, #c28e88)" />
    </IconShell>
  );
}

function SetsIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M15 96c4-13 11-20 22-24 4-2 7-5 7-10V52" {...bodyStroke} />
      <path d="M81 96c-3-12-10-20-21-24-4-2-7-5-7-10V52" {...bodyStroke} />
      <path d="M39 39c1 8 5 12 10 12s9-4 10-12" {...bodyStroke} />
      <path d="M31 73c3 11 9 19 18 23 9-4 15-12 18-23" {...jewelStroke} />
      <path d="M88 28c-11 2-18 11-18 23 0 7 3 12 7 16" {...bodyStroke} />
      <path d="M89 40c5 4 5 10 2 14-3 4-8 2-8-2 0-3 2-4 4-3" {...bodyStroke} />
      <path d="M84 57c-5 6-5 13 1 21 6-8 6-15-1-21Z" {...jewelStroke} />
      <path d="M84 82c6 2 12 2 18 0" {...bodyStroke} />
      <path d="M89 91c4-5 8-6 12-3 3 3 1 8-2 11" {...bodyStroke} />
      <ellipse cx="95" cy="96" rx="7" ry="4" {...jewelStroke} />
      <circle cx="49" cy="95" r="2.2" fill="var(--category-rose, #c28e88)" />
      <circle cx="84" cy="58" r="2.2" fill="var(--category-rose, #c28e88)" />
    </IconShell>
  );
}

const ICONS: Record<CategoryIconKey, (props: IconProps) => React.ReactNode> = {
  bracelets: BraceletsIcon,
  earrings: EarringsIcon,
  necklaces: NecklacesIcon,
  rings: RingsIcon,
  sets: SetsIcon,
};

export function CategoryIcon({
  iconKey,
  ...props
}: IconProps & { iconKey: CategoryIconKey }) {
  const Icon = ICONS[iconKey];
  return <Icon {...props} />;
}

