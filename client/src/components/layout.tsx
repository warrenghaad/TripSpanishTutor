import Navigation from "@/components/nav";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background md:pl-64 flex flex-col">
      <Navigation />
      <main className="flex-1 pb-24 md:pb-0">
        <ScrollArea className="h-full w-full">
          {children}
        </ScrollArea>
      </main>
    </div>
  );
}
