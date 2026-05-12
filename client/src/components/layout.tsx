import { useEffect } from "react";
import Navigation from "@/components/nav";
import { ScrollArea } from "@/components/ui/scroll-area";
import PracticeBar from "@/components/practice-bar";
import InstallPrompt from "@/components/install-prompt";
import { startReplayWatcher } from "@/lib/offline-queue";
import { useToast } from "@/hooks/use-toast";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  useEffect(() => {
    return startReplayWatcher({
      onSuccess: (req) => {
        toast({ title: "Synced offline action", description: req.label });
      },
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-background md:pl-64 flex flex-col">
      <InstallPrompt />
      <Navigation />
      <main className="flex-1 pb-40 md:pb-24">
        <ScrollArea className="h-full w-full">
          {children}
        </ScrollArea>
      </main>
      <PracticeBar />
    </div>
  );
}
