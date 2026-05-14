import Navigation from "@/components/nav";
import { ScrollArea } from "@/components/ui/scroll-area";
import PracticeBar from "@/components/practice-bar";
import InstallPrompt from "@/components/install-prompt";
import SyncWatcher from "@/components/sync-watcher";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background md:pl-64 flex flex-col">
      <SyncWatcher />
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
