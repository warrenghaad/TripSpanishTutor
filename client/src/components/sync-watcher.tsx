import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { startReplayWatcher } from "@/lib/offline-queue";
import { syncStaged } from "@/lib/trail-store";
import { queryClient } from "@/lib/queryClient";

export default function SyncWatcher() {
  const { toast } = useToast();
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      if (!navigator.onLine || cancelled) return;
      const staged = await syncStaged();
      if (staged.trails || staged.nodes) {
        toast({
          title: "Synced offline activity",
          description: `${staged.trails} trail${staged.trails === 1 ? "" : "s"}, ${staged.nodes} node${staged.nodes === 1 ? "" : "s"} reconciled.`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/trails"] });
      }
    };
    const stopReplay = startReplayWatcher({
      onSuccess: (req) => {
        toast({ title: "Synced offline action", description: req.label });
      },
    });
    const onOnline = () => tick();
    window.addEventListener("online", onOnline);
    setTimeout(tick, 2000);
    const interval = window.setInterval(tick, 60_000);
    return () => {
      cancelled = true;
      stopReplay();
      window.removeEventListener("online", onOnline);
      window.clearInterval(interval);
    };
  }, [toast]);
  return null;
}
