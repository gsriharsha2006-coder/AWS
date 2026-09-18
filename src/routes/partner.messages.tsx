import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { RequireRole } from "@/components/require-role";
import { EmptyState, Panel, Pill, SectionHeading } from "@/components/ui-bits";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/partner/messages")({
  head: () => ({
    meta: [
      { title: "Messages — Venture Connect partner console" },
      { name: "description", content: "Conversations with founders you have marked as interesting." },
      { property: "og:title", content: "Messages — Venture Connect partner console" },
      { property: "og:description", content: "Threads open only after you mark interest." },
    ],
  }),
  component: () => (
    <RequireRole role="partner">
      <PartnerMessages />
    </RequireRole>
  ),
});

function PartnerMessages() {
  const { state, addMessage } = useStore();
  const threads = state.applications.filter(
    (a) => a.status === "Interested" && state.partnerOpportunities.some((o) => o.id === a.opportunityId),
  );
  const [activeId, setActiveId] = useState<string | null>(threads[0]?.id ?? null);
  const [text, setText] = useState("");

  if (threads.length === 0) {
    return (
      <EmptyState
        title="No conversations open"
        description="Messaging with a founder opens only after you mark their application as interested. This keeps the inbox meaningful for both sides."
        action={
          <Link to="/partner/applications" className="rounded-lg border border-border px-4 py-2.5 text-sm">
            Open review queue
          </Link>
        }
      />
    );
  }

  const active = threads.find((t) => t.id === activeId) ?? threads[0]!;
  const thread = state.messages.filter((m) => m.applicationId === active.id);

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    addMessage(active.id, "partner", text.trim());
    setText("");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
      <nav aria-label="Conversations" className="surface-panel h-fit p-3">
        <ul className="space-y-1">
          {threads.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setActiveId(t.id)}
                aria-current={t.id === active.id ? "true" : undefined}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${t.id === active.id ? "bg-primary/15 text-primary" : "hover:bg-surface-2"}`}
              >
                <span className="block truncate font-medium">{t.founderName}</span>
                <span className="block truncate text-xs text-muted-foreground">{t.ideaName}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <Panel className="flex min-h-[28rem] flex-col">
        <SectionHeading
          eyebrow={active.opportunityTitle}
          title={active.founderName}
          description={`${active.ideaName} · ${active.stage} · workspace ${active.workspaceCompletion}%`}
          action={<Pill tone="success">Interest confirmed</Pill>}
        />
        <div className="flex-1 space-y-3 overflow-y-auto rounded-lg border border-border bg-surface-2/40 p-4">
          {thread.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No messages yet. Tell the founder what you would like to see next.
            </p>
          ) : (
            thread.map((m) => (
              <div key={m.id} className={m.from === "partner" ? "text-right" : "text-left"}>
                <p className="label-caps">{m.from === "partner" ? "You" : active.founderName}</p>
                <p className={`mt-1 inline-block max-w-[85%] rounded-xl px-3.5 py-2 text-sm ${m.from === "partner" ? "bg-primary/20" : "bg-surface-2"}`}>
                  {m.text}
                </p>
              </div>
            ))
          )}
        </div>
        <form className="mt-4 flex gap-2" onSubmit={send}>
          <label htmlFor="pmsg" className="sr-only">Message</label>
          <input
            id="pmsg"
            className="flex-1 rounded-lg border border-input bg-surface px-3 py-2.5 text-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask for the evidence or materials you need next"
          />
          <button type="submit" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
            Send
          </button>
        </form>
      </Panel>
    </div>
  );
}
