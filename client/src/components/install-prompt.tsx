import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "vv-install-dismissed";

export default function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler as EventListener);
    return () => window.removeEventListener("beforeinstallprompt", handler as EventListener);
  }, []);

  if (!visible || !evt) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const install = async () => {
    try {
      await evt.prompt();
      await evt.userChoice;
    } finally {
      setVisible(false);
    }
  };

  return (
    <div
      className="fixed top-2 left-2 right-2 md:top-4 md:left-auto md:right-4 md:w-80 z-[60] bg-white border border-primary/30 rounded-2xl shadow-xl p-3 flex items-start gap-3"
      data-testid="install-prompt"
    >
      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
        <Download className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-foreground">Install Vallarta Voz</p>
        <p className="text-xs text-muted-foreground mb-2">Add to your home screen so it works without a browser tab — and offline once you've built a Trip Pack.</p>
        <div className="flex gap-1.5">
          <Button size="sm" className="bg-primary text-xs h-7" onClick={install} data-testid="button-install-pwa">Install</Button>
          <Button size="sm" variant="ghost" className="text-xs h-7" onClick={dismiss} data-testid="button-dismiss-install">Not now</Button>
        </div>
      </div>
      <button onClick={dismiss} className="text-muted-foreground hover:text-foreground" aria-label="dismiss">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
