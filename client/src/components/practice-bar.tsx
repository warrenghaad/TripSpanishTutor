import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Wifi, WifiOff, Package, X, ChevronUp, Database, Languages, MessageCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useOnline } from "@/lib/use-online";
import { useLocale } from "@/lib/locale-context";
import { getActivePack, lookupInPack } from "@/lib/pack-store";
import type { TripPack } from "@/lib/pack-store";
import { recordNode } from "@/lib/trail-store";
import { enqueueRequest } from "@/lib/offline-queue";

type Mode = "ask" | "translate" | "practice";

type Msg = {
  role: "user" | "assistant";
  text: string;
  source?: "pack" | "live" | "queued";
  confidence?: "high" | "medium" | "low";
  mode?: Mode;
};

const MODE_META: Record<Mode, { label: string; icon: typeof MessageCircle; placeholder: string; trailKind: "question" | "translation" | "grammar" }> = {
  ask: { label: "Ask", icon: MessageCircle, placeholder: "Ask anything in English or Spanish…", trailKind: "question" },
  translate: { label: "Translate", icon: Languages, placeholder: "Type a sentence to translate…", trailKind: "translation" },
  practice: { label: "Practice", icon: Pencil, placeholder: "Try a sentence — I'll gently coach.", trailKind: "grammar" },
};

export default function PracticeBar() {
  const online = useOnline();
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("ask");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [pack, setPack] = useState<TripPack | undefined>();
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    getActivePack().then(setPack).catch(() => {});
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9999, behavior: "smooth" });
  }, [messages, open]);

  // Esc to close + outside click to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (containerRef.current?.contains(t)) return;
      if (triggerRef.current?.contains(t)) return;
      setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text, mode }]);
    setBusy(true);

    const meta = MODE_META[mode];
    const packHit = pack ? lookupInPack(pack, text) : undefined;

    // Offline path — record node + queue for replay regardless of mode
    if (!online) {
      const answerText = packHit
        ? packHit.text
        : mode === "translate"
          ? "Saved — will translate when you're back online."
          : pack
            ? "I'm offline and didn't find that in your trip pack. Saved — I'll answer when you reconnect."
            : "I'm offline. Saved — I'll answer when you reconnect.";
      const source: "pack" | "queued" = packHit ? "pack" : "queued";
      setMessages((m) => [...m, { role: "assistant", text: answerText, source, confidence: packHit?.confidence }]);

      const node = await recordNode(meta.trailKind, text, { request: { text, mode }, response: answerText, packHit }, source);

      const endpoint = mode === "translate" ? "/api/translate" : "/api/chat";
      const body = mode === "translate"
        ? { text, target: "es", preset: "general", soften: false, locale }
        : {
            messages: [
              ...(mode === "practice" ? [{ role: "system", content: "You are a gentle Spanish coach. Confirm what works, fix what doesn't with a one-line explanation, then suggest one expansion." }] : []),
              { role: "user", content: text },
            ],
            locale,
          };
      await enqueueRequest({
        endpoint,
        method: "POST",
        body,
        label: `${meta.label}: "${text.slice(0, 40)}"`,
        trailId: node?.trailId,
        trailNodeId: node?.nodeId,
      });
      setBusy(false);
      return;
    }

    // Online path — choose endpoint by mode
    try {
      if (mode === "translate") {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, target: "es", preset: "general", soften: false, locale }),
        });
        if (!res.ok) throw new Error("translate failed");
        const data = await res.json();
        setMessages((m) => [...m, { role: "assistant", text: data.translation, source: "live" }]);
        recordNode("translation", `${text} → ${data.translation}`, { source: text, target: data.translation }, "live");
      } else {
        const sysHint = mode === "practice"
          ? "You are a gentle Spanish coach. The user will offer a sentence. Respond briefly: confirm what works, fix what doesn't with a one-line explanation, then suggest one expansion."
          : undefined;
        const seedMessages = [
          ...(sysHint ? [{ role: "system", content: sysHint }] : []),
          ...messages.map((m) => ({ role: m.role, content: m.text })),
          { role: "user", content: text },
        ];
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: seedMessages, locale }),
        });
        if (!res.ok) throw new Error("Chat failed");
        const data = await res.json();
        setMessages((m) => [...m, { role: "assistant", text: data.reply, source: "live" }]);
        recordNode(meta.trailKind, text, { answer: data.reply }, "live");
      }
    } catch {
      if (packHit) {
        setMessages((m) => [...m, { role: "assistant", text: packHit.text, source: "pack", confidence: packHit.confidence }]);
        recordNode(meta.trailKind, text, { answer: packHit.text, packHit }, "pack");
      } else {
        setMessages((m) => [...m, { role: "assistant", text: "Couldn't reach the server. Try again in a moment.", source: "live" }]);
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
            ref={containerRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 md:bottom-20 left-2 right-2 md:left-auto md:right-6 md:w-[460px] z-50 bg-white rounded-2xl shadow-2xl border border-border/50 overflow-hidden"
            data-testid="practice-bar-dropdown"
            role="dialog"
            aria-label="Practice bar"
          >
            <div className="bg-gradient-to-r from-primary to-secondary p-3 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 flex-wrap">
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
              <button onClick={() => setOpen(false)} className="hover:bg-white/10 rounded-lg p-1" data-testid="button-close-practice" aria-label="Close practice bar">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-3 pt-2 pb-1 flex gap-1 bg-muted/20" role="tablist">
              {(Object.keys(MODE_META) as Mode[]).map((m) => {
                const Icon = MODE_META[m].icon;
                const active = mode === m;
                return (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    role="tab"
                    aria-selected={active}
                    className={`flex-1 text-xs font-medium px-2 py-1.5 rounded-md flex items-center justify-center gap-1 transition ${
                      active ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:bg-white/50"
                    }`}
                    data-testid={`button-mode-${m}`}
                  >
                    <Icon className="w-3 h-3" /> {MODE_META[m].label}
                  </button>
                );
              })}
            </div>

            <div ref={scrollRef} className="max-h-[300px] overflow-y-auto p-3 space-y-2 bg-muted/10">
              {messages.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">
                  {MODE_META[mode].placeholder}
                  <br />
                  {online ? "Saves to your active trail." : "Offline — answers come from your trip pack; translations queue."}
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
                      <Database className="w-3 h-3" /> from pack ({m.confidence})
                    </div>
                  )}
                  {m.role === "assistant" && m.source === "queued" && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-blue-700">
                      <WifiOff className="w-3 h-3" /> queued for sync
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
                placeholder={MODE_META[mode].placeholder}
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
        ref={triggerRef}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 md:bottom-4 left-2 right-2 md:left-auto md:right-6 md:w-[460px] z-40 bg-white border border-border/50 shadow-lg rounded-2xl px-4 py-3 flex items-center justify-between hover:border-primary/40 transition"
        data-testid="button-open-practice"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-foreground">Practice bar · {MODE_META[mode].label}</div>
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
