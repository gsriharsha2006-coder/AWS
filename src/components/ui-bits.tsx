import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { JourneyStage } from "@/lib/types";

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("surface-panel p-5 sm:p-6", className)}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow ? <p className="label-caps mb-1">{eyebrow}</p> : null}
        <h2 className="font-display text-xl font-semibold sm:text-2xl">{title}</h2>
        {description ? <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  tone?: "default" | "primary" | "warning" | "success";
}) {
  const toneClass =
    tone === "primary"
      ? "text-primary"
      : tone === "warning"
        ? "text-warning"
        : tone === "success"
          ? "text-success"
          : "text-foreground";
  return (
    <div className="glass-panel p-4">
      <p className="label-caps">{label}</p>
      <p className={cn("mt-2 font-display text-2xl font-semibold", toneClass)}>{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "primary" | "warning" | "success" | "danger" | "muted";
}) {
  const tones: Record<string, string> = {
    neutral: "border-border bg-surface-2 text-foreground",
    primary: "border-primary/40 bg-primary/15 text-primary",
    warning: "border-warning/40 bg-warning/12 text-warning",
    success: "border-success/40 bg-success/12 text-success",
    danger: "border-destructive/40 bg-destructive/12 text-destructive",
    muted: "border-border bg-transparent text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function ScoreBar({
  label,
  score,
  explanation,
}: {
  label: string;
  score: number;
  explanation?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const tone = clamped >= 70 ? "bg-success" : clamped >= 50 ? "bg-primary" : "bg-warning";
  return (
    <div className="glass-panel p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium">{label}</p>
        <p className="font-display text-xl font-semibold">{clamped}</p>
      </div>
      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${clamped} out of 100, AI assessment`}
      >
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${clamped}%` }} />
      </div>
      {explanation ? <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{explanation}</p> : null}
    </div>
  );
}

const JOURNEY: JourneyStage[] = ["Explorer", "Validated", "Builder", "Venture Ready"];

export function JourneyTrack({ current }: { current: JourneyStage }) {
  const index = JOURNEY.indexOf(current);
  return (
    <ol className="flex flex-wrap items-center gap-2" aria-label="Founder readiness journey">
      {JOURNEY.map((stage, i) => {
        const active = i <= index;
        return (
          <li key={stage} className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                active ? "border-primary/50 bg-primary/15 text-primary" : "border-border text-muted-foreground",
              )}
              aria-current={i === index ? "step" : undefined}
            >
              {i === index ? `▸ ${stage}` : stage}
            </span>
            {i < JOURNEY.length - 1 ? <span aria-hidden className="text-muted-foreground">—</span> : null}
          </li>
        );
      })}
    </ol>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface-panel flex flex-col items-center gap-3 px-6 py-12 text-center">
      <p className="label-caps">Venture Connect</p>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
      <p className="font-medium text-destructive">Something didn't work</p>
      <p className="mt-1 text-muted-foreground">{message}</p>
    </div>
  );
}
