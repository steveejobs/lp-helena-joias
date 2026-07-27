import type { SVGProps } from "react";

import type { CategoryIconKey } from "@/types/commerce";

type IconProps = SVGProps<SVGSVGElement> & {
  label?: string;
  simplified?: boolean;
};

function IconShell({ children, label, simplified = false, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 64 64"
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

const line = {
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 1.35,
  vectorEffect: "non-scaling-stroke" as const,
};

const accent = {
  ...line,
  stroke: "var(--category-jewel, #9b7148)",
};

function NecklacesIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M13 15.5c1.8 17.2 8.2 28.4 19 28.4s17.2-11.2 19-28.4" {...line} />
      <path d="M17 17.2c2.4 13.9 7.5 22.2 15 22.2s12.6-8.3 15-22.2" {...accent} opacity=".5" />
      <path d="m32 42.8 5 6.2-5 6.2-5-6.2 5-6.2Z" {...accent} />
      <circle cx="13" cy="15.5" r="1.7" fill="var(--category-rose, #bd8882)" />
      <circle cx="51" cy="15.5" r="1.7" fill="var(--category-rose, #bd8882)" />
    </IconShell>
  );
}

function EarringsIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <circle cx="21" cy="16" r="3.1" {...accent} />
      <circle cx="43" cy="16" r="3.1" {...accent} />
      <path d="M21 20.5v7.2M43 20.5v7.2" {...line} />
      <path d="M14.8 39.5c0-6.2 3.1-10.4 6.2-10.4s6.2 4.2 6.2 10.4S24.1 51 21 51s-6.2-5.3-6.2-11.5Z" {...accent} />
      <path d="M36.8 39.5c0-6.2 3.1-10.4 6.2-10.4s6.2 4.2 6.2 10.4S46.1 51 43 51s-6.2-5.3-6.2-11.5Z" {...accent} />
      <path d="M18.2 39.8c.4 3.4 1.3 6.1 2.8 8M40.2 39.8c.4 3.4 1.3 6.1 2.8 8" {...line} opacity=".45" />
    </IconShell>
  );
}

function BraceletsIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <circle cx="27" cy="32" r="17" {...line} />
      <circle cx="37" cy="32" r="17" {...accent} />
      <path d="M21.6 16a17 17 0 0 1 10.8 0M31.6 48a17 17 0 0 1 10.8 0" {...accent} opacity=".5" />
      <path d="m46.8 19.4 4.1-4.1 3.8 3.8-4.1 4.1" {...accent} />
      <circle cx="16.6" cy="45.4" r="2.2" fill="var(--category-rose, #bd8882)" />
    </IconShell>
  );
}

function RingsIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <circle cx="27" cy="37" r="15.5" {...line} />
      <circle cx="37" cy="37" r="15.5" {...accent} />
      <path d="m37 9.5 7.2 7-7.2 7-7.2-7 7.2-7Z" {...accent} />
      <path d="m31.4 12.1 5.6 4.4 5.6-4.4M37 16.5v6.3" {...line} opacity=".55" />
    </IconShell>
  );
}

function SetsIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M12.5 13.5c1.6 13.1 6.2 21.2 13.5 21.2s11.9-8.1 13.5-21.2" {...line} />
      <path d="m26 33.8 4.2 5.2-4.2 5.2-4.2-5.2 4.2-5.2Z" {...accent} />
      <circle cx="48" cy="19" r="3" {...accent} />
      <path d="M48 23v5.3" {...line} />
      <path d="M43.5 36.4c0-4.7 2.2-7.8 4.5-7.8s4.5 3.1 4.5 7.8-2.2 8.7-4.5 8.7-4.5-4-4.5-8.7Z" {...accent} />
      <circle cx="38" cy="49" r="7" {...line} />
      <path d="m38 38.5 3.5 3.5-3.5 3.5-3.5-3.5 3.5-3.5Z" fill="var(--category-rose, #bd8882)" />
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

export function CategoryIcon({ iconKey, ...props }: IconProps & { iconKey: CategoryIconKey }) {
  const Icon = ICONS[iconKey];
  return <Icon {...props} />;
}
