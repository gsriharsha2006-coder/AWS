import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { RequireRole } from "@/components/require-role";
import { EmptyState, Panel, Pill, SectionHeading } from "@/components/ui-bits";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/founder/messages")({
  head: () => ({
    meta: [
      { title: "Messages — Venture Connect" },
      { name: "description", content: "Conversations with ecosystem partners, unlocked once a partner marks interest." },
      { property: "og:title", content: "Messages — Venture Connect" },
      { property: "og:description", content: "Deal progression, not a general chat inbox." },
    ],
  }),
  component: () => (
    <RequireRole role="founder">
      <Messages />
    </RequireRole>
  ),
});

function Messages() {
  const { state, addMessage } = useStore();
  const unlocked = state.applications.filter((a) => a.status === "Interested");
  const [activeId, setActiveId] = useState<string | null>(unlocked[0]?.id ?? null);
  const [text, setText] = useState("");

  if (unlocked.length === 0) {
    return (
      <EmptyState
        title="No conversations yet"
        description="Messaging opens only after an ecosystem partner marks your application as interested. Until then, your application speaks for you."
        action={
          <Link to="/founder/applications" className="rounded-lg border border-border px-4 py-2.5 text-sm">
            View applications
          </Link>
        }
      />
    );
  }

  const active = unlocked.find((a) => a.id === activeId) ?? unlocked[0]!;
  const thread = state.messages.filter((m) => m.applicationId === active.id);

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    addMessage(active.id, "founder", text.trim());
    setText("");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
      <nav aria-label="Conversations" className="surface-panel h-fit p-3">
        <ul className="space-y-1">
          {unlocked.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => setActiveId(a.id)}
                aria-current={a.id === active.id ? "true" : undefined}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${a.id === active.id ? "bg-primary/15 text-primary" : "hover:bg-surface-2"}`}
              >
                <span className="block truncate font-medium">{a.organization}</span>
                <span className="block truncate text-xs text-muted-foreground">{a.opportunityTitle}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <Panel className="flex min-h-[28rem] flex-col">
        <SectionHeading
          eyebrow={active.opportunityTitle}
          title={active.organization}
          action={<Pill tone="success">Interest confirmed</Pill>}
        />
        <div className="flex-1 space-y-3 overflow-y-auto rounded-lg border border-border bg-surface-2/40 p-4">
          {thread.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This thread opened because the partner marked interest. Start with what you need from them.
            </p>
          ) : (
            thread.map((m) => (
              <div key={m.id} className={m.from === "founder" ? "text-right" : "text-left"}>
                <p className="label-caps">{m.from === "founder" ? "You" : active.organization}</p>
                <p className={`mt-1 inline-block max-w-[85%] rounded-xl px-3.5 py-2 text-sm ${m.from === "founder" ? "bg-primary/20" : "bg-surface-2"}`}>
                  {m.text}
                </p>
              </div>
            ))
          )}
        </div>
        <form className="mt-4 flex gap-2" onSubmit={send}>
          <label htmlFor="msg" className="sr-only">Message</label>
          <input
            id="msg"
            className="flex-1 rounded-lg border border-input bg-surface px-3 py-2.5 text-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your next milestone or ask what they need"
          />
          <button type="submit" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
            Send
          </button>
        </form>
      </Panel>
    </div>
  );
}
