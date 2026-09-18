import { Link } from "@tanstack/react-router";

export function BrandMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const box = size === "lg" ? "h-11 w-11 text-base" : size === "sm" ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-sm";
  const text = size === "lg" ? "text-lg" : size === "sm" ? "text-xs" : "text-sm";
  return (
    <span className="flex items-center gap-3">
      <span
        aria-hidden
        className={`grid ${box} place-items-center rounded-lg border border-border bg-surface-2 font-display font-bold tracking-tight text-foreground`}
      >
        VC
      </span>
      <span className={`font-display font-semibold uppercase tracking-[0.18em] ${text}`}>
        Venture Connect
      </span>
    </span>
  );
}

export function BrandLink({ to = "/", size = "md" }: { to?: string; size?: "sm" | "md" | "lg" }) {
  return (
    <Link to={to} className="rounded-md" aria-label="Venture Connect home">
      <BrandMark size={size} />
    </Link>
  );
}
