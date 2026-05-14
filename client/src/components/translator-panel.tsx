import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, ArrowRightLeft, Copy, Sparkles, X, Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/lib/locale-context";
import { locales } from "@/lib/data";
import { useOnline } from "@/lib/use-online";
import { smartFetch } from "@/lib/api-fetch";

type TranslationResult = {
  translation: string;
  alternatives?: string[];
  localeNotes?: string[];
};

export default function TranslatorPanel() {
  const [open, setOpen] = useState(false);
  const [sourceText, setSourceText] = useState("");
  const [targetLang, setTargetLang] = useState<"es" | "en">("es");
  const [preset, setPreset] = useState<"general" | "journal" | "travel" | "arts">("general");
  const [soften, setSoften] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { locale, setLocale } = useLocale();

  const online = useOnline();
  const translateMutation = useMutation({
    mutationFn: async (data: { text: string; target: string; preset: string; soften: boolean; locale: string }) => {
      const r = await smartFetch<TranslationResult>({
        endpoint: "/api/translate",
        body: data,
        trailKind: "translation",
        label: `Translate: "${data.text.slice(0, 40)}"`,
        lookupKey: data.text,
        packToResponse: (text, confidence) => ({
          translation: text,
          alternatives: [],
          localeNotes: [`From your saved trip pack (${confidence} confidence). Will refresh with a live translation when you reconnect.`],
        }),
        offlineFallback: () => ({
          translation: "(queued — will translate when online)",
          alternatives: [],
          localeNotes: ["You're offline. We saved this and will translate it as soon as you reconnect."],
        }),
      });
      return r.data;
    },
    onSuccess: (data) => setResult(data),
    onError: () => {
      toast({ title: "Translation failed", description: "Please try again.", variant: "destructive" });
    },
  });

  const handleTranslate = () => {
    if (!sourceText.trim()) return;
    translateMutation.mutate({ text: sourceText, target: targetLang, preset, soften, locale });
  };

  const handleSwap = () => {
    if (result?.translation) {
      setSourceText(result.translation);
      setResult(null);
    }
    setTargetLang(targetLang === "es" ? "en" : "es");
  };

  const handleCopy = () => {
    if (result?.translation) {
      navigator.clipboard.writeText(result.translation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed right-20 bottom-20 md:bottom-4 z-50 w-14 h-14 rounded-full bg-secondary text-white shadow-lg shadow-secondary/30 flex items-center justify-center hover:bg-secondary/90 transition-colors"
            data-testid="button-open-translator"
          >
            <Languages className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full md:w-[380px] bg-white shadow-2xl border-l border-border/50 flex flex-col"
            data-testid="panel-translator"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-secondary text-white">
              <div className="flex items-center gap-2">
                <Languages className="w-5 h-5" />
                <h3 className="font-display font-bold">Translator</h3>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/10 h-8 w-8"
                onClick={() => setOpen(false)}
                data-testid="button-close-translator"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 text-center">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {targetLang === "es" ? "English" : "Spanish"}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-secondary hover:bg-secondary/10"
                  onClick={handleSwap}
                  data-testid="button-swap-languages"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </Button>
                <div className="flex-1 text-center">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {targetLang === "es" ? "Spanish" : "English"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Select value={locale} onValueChange={setLocale}>
                  <SelectTrigger className="text-xs h-8" data-testid="select-locale">
                    <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    {locales.map((l) => (
                      <SelectItem key={l.id} value={l.id} data-testid={`locale-option-${l.id}`}>
                        <span className="font-medium">{l.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-2 gap-2">
                  <Select value={preset} onValueChange={(v: any) => setPreset(v)}>
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue placeholder="Preset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="journal">Journal (Gentle)</SelectItem>
                      <SelectItem value="travel">Travel Phrases</SelectItem>
                      <SelectItem value="arts">Arts & Music</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    variant={soften ? "default" : "outline"} 
                    size="sm" 
                    className={`text-xs h-8 ${soften ? "bg-primary" : ""}`}
                    onClick={() => setSoften(!soften)}
                    data-testid="button-toggle-soften"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Mindful Tone
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder={targetLang === "es" ? "Type in English..." : "Escribe en español..."}
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  className="min-h-[120px] resize-none"
                  data-testid="textarea-source"
                />
                <Button 
                  onClick={handleTranslate} 
                  disabled={translateMutation.isPending || !sourceText.trim()}
                  className="w-full bg-primary"
                  data-testid="button-translate"
                >
                  {translateMutation.isPending ? "Translating..." : "Translate"}
                </Button>
              </div>

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="bg-secondary/5 rounded-xl p-4 border border-secondary/20">
                    <p className="text-lg font-display text-foreground leading-relaxed" data-testid="text-translation">
                      {result.translation}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs"
                        onClick={handleCopy}
                        data-testid="button-copy-translation"
                      >
                        {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </div>

                  {result.localeNotes && result.localeNotes.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Regional Notes
                      </h4>
                      {result.localeNotes.map((note, idx) => (
                        <div
                          key={idx}
                          className="bg-amber-50 border border-amber-200/50 rounded-lg p-3 text-sm text-amber-900"
                          data-testid={`text-locale-note-${idx}`}
                        >
                          {note}
                        </div>
                      ))}
                    </div>
                  )}

                  {result.alternatives && result.alternatives.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Mindful Alternatives
                      </h4>
                      {result.alternatives.map((alt, idx) => (
                        <div 
                          key={idx} 
                          className="bg-muted/50 rounded-lg p-3 text-sm text-foreground/80"
                          data-testid={`text-alternative-${idx}`}
                        >
                          {alt}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
