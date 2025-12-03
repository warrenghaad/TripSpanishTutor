import { Link, useLocation } from "wouter";
import { Home, BookOpen, MessageSquare, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const [location] = useLocation();

  const items = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/learn", icon: BookOpen, label: "Learn" },
    { href: "/situations", icon: MessageSquare, label: "Situations" },
    { href: "/journal", icon: PenTool, label: "Journal" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border/40 pb-safe pt-2 px-6 z-50 md:top-0 md:left-0 md:bottom-0 md:w-64 md:border-r md:border-t-0 md:flex-col md:pt-8 md:px-4 md:h-screen">
      <div className="hidden md:block mb-8 px-4">
        <h1 className="font-display text-2xl font-bold text-primary">Vallarta Voz</h1>
      </div>
      
      <ul className="flex justify-between md:flex-col md:space-y-2">
        {items.map((item) => {
          const isActive = location === item.href;
          return (
            <li key={item.href}>
              <Link 
                href={item.href}
                className={cn(
                  "flex flex-col items-center p-2 rounded-xl transition-all duration-200 md:flex-row md:space-x-3 md:px-4 md:py-3",
                  isActive 
                    ? "text-primary bg-primary/10 md:bg-primary/10" 
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                )}
              >
                <item.icon className={cn("h-6 w-6 mb-1 md:mb-0", isActive && "stroke-[2.5px]")} />
                <span className="text-[10px] font-medium md:text-sm">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
