import Layout from "@/components/layout";
import { useEffect, useRef, useState } from "react";
import { useRoute, useSearch, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/lib/locale-context";
import {
  getLocalCard,
  loadLocalThread,
  saveLocalThread,
  updateLocalCard,
  type LocalTranslationCard,
} from "@/lib/translation-store";

type Msg = { role: "user" | "assistant"; content: string; createdAt: string };
type SeededChatResponse = { reply: string; conversationId: number };

export default function ChatPage() {
  const [, params] = useRoute<{ id: string }>("/chat/:id");
  const search = useSearch();
  // Support both the route param (/chat/:id) and the spec's query-param
  // form (/chat?cardId=ID) so external links can land here either way.
  const cardId = (() => {
    if (params?.id) return parseInt(params.id);
    const q = new URLSearchParams(search).get("cardId");
    return q ? parseInt(q) : undefined;
  })();
  const { locale } = useLocale();
  const { toast } = useToast();
  const [card, setCard] = useState<LocalTranslationCard | undefined>();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  // Hold the live conversation ID outside React state so concurrent sends
  // never re-submit `null` and create a fresh server-side conversation.
  const conversationIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!cardId) return;
      const c = await getLocalCard(cardId);
      if (!alive) return;
      setCard(c);
      conversationIdRef.current = c?.conversationId ?? undefined;
      const thread = await loadLocalThread(cardId);
      if (thread) {
        setMessages(thread.messages as Msg[]);
        if (thread.conversationId) conversationIdRef.current = thread.conversationId;
      } else if (c) {
        // Seed with an automatic first prompt to the AI based on the card.
        await sendSeedKick(c, []);
      }
    })();
    return () => { alive = false; };
  }, [cardId]);

  async function persistConversationId(c: LocalTranslationCard, conversationId: number) {
    if (conversationIdRef.current === conversationId) return;
    conversationIdRef.current = conversationId;
    const updated = await updateLocalCard(c.id, { conversationId });
    if (updated) setCard(updated);
    if (c.serverId) {
      try {
        await fetch(`/api/translation-cards/${c.serverId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId }),
        });
      } catch {
        // server mirror is best-effort
      }
    }
  }

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function sendSeedKick(c: LocalTranslationCard, existing: Msg[]) {
    setBusy(true);
    try {
      const res = await fetch("/api/chat/seeded", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: c.serverId,
          conversationId: conversationIdRef.current,
          messages: existing,
          locale,
        }),
      });
      if (!res.ok) throw new Error("chat failed");
      const data = (await res.json()) as SeededChatResponse;
      await persistConversationId(c, data.conversationId);
      const reply: Msg = { role: "assistant", content: data.reply, createdAt: new Date().toISOString() };
      const next = [...existing, reply];
      setMessages(next);
      await saveLocalThread({ cardId: c.id, conversationId: data.conversationId, messages: next });
    } catch {
      toast({ title: "Could not start chat", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  const send = async () => {
    if (!input.trim() || !card) return;
    const userMsg: Msg = { role: "user", content: input.trim(), createdAt: new Date().toISOString() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    if (!card.serverId) {
      toast({ title: "Sync needed", description: "Card not synced yet — try again in a moment." });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/chat/seeded", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: card.serverId,
          conversationId: conversationIdRef.current,
          messages: next,
          locale,
        }),
      });
      if (!res.ok) throw new Error("chat failed");
      const data = (await res.json()) as SeededChatResponse;
      await persistConversationId(card, data.conversationId);
      const reply: Msg = { role: "assistant", content: data.reply, createdAt: new Date().toISOString() };
      const after = [...next, reply];
      setMessages(after);
      await saveLocalThread({ cardId: card.id, conversationId: data.conversationId, messages: after });
    } catch {
      toast({ title: "Reply failed", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  if (!card) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link href="/"><Button variant="ghost"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button></Link>
          <p className="text-muted-foreground mt-4">Card not found.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 flex flex-col h-[calc(100vh-6rem)]">
        <Link href="/"><Button variant="ghost" size="sm" data-testid="button-back"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Translate</Button></Link>

        <Card className="p-3 my-3 bg-muted/40">
          <p className="text-xs uppercase text-muted-foreground tracking-wider">Talking about</p>
          <p className="text-sm font-medium">{card.translatedText}</p>
          <p className="text-xs text-muted-foreground italic">{card.sourceText}</p>
        </Card>

        <div ref={listRef} className="flex-1 overflow-y-auto space-y-2 pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                "max-w-[85%] rounded-2xl px-3 py-2 text-sm " +
                (m.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "mr-auto bg-muted text-foreground")
              }
              data-testid={`chat-msg-${i}`}
            >
              {m.content}
            </div>
          ))}
          {busy && <p className="text-xs text-muted-foreground italic">…thinking</p>}
        </div>

        <div className="flex gap-2 pt-3 border-t border-border/40">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this sentence…"
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            data-testid="input-chat"
          />
          <Button onClick={send} disabled={busy || !input.trim()} data-testid="button-chat-send">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}
