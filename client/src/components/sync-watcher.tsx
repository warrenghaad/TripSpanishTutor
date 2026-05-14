import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { replayQueue } from "@/lib/offline-queue";
import { syncStaged } from "@/lib/trail-store";
import { queryClient } from "@/lib/queryClient";

export default function SyncWatcher() {
  const { toast } = useToast();
  useEffect(() => {
    let cancelled = false;

    // Critical ordering: ALWAYS reconcile staged trails/nodes before replay
    // so queued requests with negative ids get remapped to real ones first.
    // Otherwise replay could dequeue without upgrading the linked node.
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
      const result = await replayQueue({
        onSuccess: (req) => {
          toast({ title: "Synced offline action", description: req.label });
        },
      });
      if (result.replayed > 0) {
        queryClient.invalidateQueries({ queryKey: ["/api/trails"] });
      }
    };

    const onOnline = () => tick();
    window.addEventListener("online", onOnline);
    const initial = setTimeout(tick, 1500);
    const interval = window.setInterval(tick, 60_000);
    return () => {
      cancelled = true;
      window.removeEventListener("online", onOnline);
      window.clearInterval(interval);
      clearTimeout(initial);
    };
  }, [toast]);
  return null;
}
