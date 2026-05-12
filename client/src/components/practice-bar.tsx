import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Wifi, WifiOff, Package, X, ChevronUp, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useOnline } from "@/lib/use-online";
import { useLocale } from "@/lib/locale-context";
import { getActivePack, lookupInPack } from "@/lib/pack-store";
import type { TripPack } from "@/lib/pack-store";
import { recordNode } from "@/lib/trail-store";

type Msg = {
  role: "user" | "assistant";
  text: string;
  source?: "pack" | "live";
  confidence?: "high" | "medium" | "low";
};

export default function PracticeBar() {
  const online = useOnline();
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [pack, setPack] = useState<TripPack | undefined>();
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getActivePack().then(setPack).catch(() => {});
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9999, behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setBusy(true);

    // Try pack first if offline OR pack has a high-confidence answer
    const packHit = pack ? lookupInPack(pack, text) : undefined;
    if (!online && packHit) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: packHit.text, source: "pack", confidence: packHit.confidence },
      ]);
      recordNode("question", text, { answer: packHit.text, packHit }, "pack");
      setBusy(false);
      return;
    }
    if (!online && !packHit) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: pack
            ? "I'm offline and couldn't find that in your trip pack. Try a simpler word, or rebuild the pack with broader interests."
            : "I'm offline and you haven't built a trip pack yet. When you're back online, build one from the home page so I can answer offline.",
          source: "pack",
          confidence: "low",
        },
      ]);
      setBusy(false);
      return;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages.map((m) => ({ role: m.role, content: m.text })), { role: "user", content: text }],
          locale,
        }),
      });
      if (!res.ok) throw new Error("Chat failed");
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", text: data.reply, source: "live" }]);
      recordNode("question", text, { answer: data.reply }, "live");
    } catch {
      // Live failed; fall back to pack if we have one
      if (packHit) {
        setMessages((m) => [
          ...m,
          { role: "assistant", text: packHit.text, source: "pack", confidence: packHit.confidence },
        ]);
        recordNode("question", text, { answer: packHit.text, packHit }, "pack");
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant", text: "Sorry — couldn't reach the server. Try again in a moment.", source: "live" },
        ]);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 md:bottom-20 left-2 right-2 md:left-auto md:right-6 md:w-[420px] z-50 bg-white rounded-2xl shadow-2xl border border-border/50 overflow-hidden"
            data-testid="practice-bar-dropdown"
          >
            <div className="bg-gradient-to-r from-primary to-secondary p-3 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="font-display font-bold">Practice</span>
                {online ? (
                  <span className="flex items-center gap-1 text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                    <Wifi className="w-3 h-3" /> live
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                    <WifiOff className="w-3 h-3" /> offline
                  </span>
                )}
                {pack && (
                  <span className="flex items-center gap-1 text-[10px] bg-white/20 px-2 py-0.5 rounded-full" data-testid="badge-pack-active">
                    <Package className="w-3 h-3" /> pack: {pack.locale}
                  </span>
                )}
              </div>
              <button onClick={() => setOpen(false)} className="hover:bg-white/10 rounded-lg p-1" data-testid="button-close-practice">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div ref={scrollRef} className="max-h-[320px] overflow-y-auto p-3 space-y-2 bg-muted/10">
              {messages.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">
                  Ask anything in English or Spanish.<br />
                  {online ? "Live answers + saves to your trail." : "Offline — answers come from your trip pack."}
                </p>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`text-sm rounded-xl px-3 py-2 max-w-[85%] ${
                    m.role === "user"
                      ? "ml-auto bg-primary text-white"
                      : "bg-white border border-border/40 text-foreground"
                  }`}
                  data-testid={`practice-msg-${i}`}
                >
                  {m.text}
                  {m.role === "assistant" && m.source === "pack" && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-700">
                      <Database className="w-3 h-3" />
                      from pack ({m.confidence})
                    </div>
                  )}
                </div>
              ))}
              {busy && <div className="text-xs text-muted-foreground italic">thinking…</div>}
            </div>

            <div className="p-2 border-t border-border/40 flex gap-2 bg-white">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={online ? "Type a phrase or question…" : "Search your trip pack…"}
                className="flex-1 text-sm border border-border/40 rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                data-testid="input-practice"
              />
              <Button onClick={send} size="sm" disabled={busy || !input.trim()} data-testid="button-send-practice">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 md:bottom-4 left-2 right-2 md:left-auto md:right-6 md:w-[420px] z-40 bg-white border border-border/50 shadow-lg rounded-2xl px-4 py-3 flex items-center justify-between hover:border-primary/40 transition"
        data-testid="button-open-practice"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-foreground">Practice bar</div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
              {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {online ? "live" : "offline"}
              {pack && <> · pack: {pack.locale}</>}
            </div>
          </div>
        </div>
        <ChevronUp className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
    </>
  );
}
