import { Link, useLocation } from "wouter";
import { Home, BookOpen, PenTool, Search, MapPin, Package, Footprints, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/locale-context";
import { locales } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Navigation() {
  const [location] = useLocation();
  const { locale, setLocale } = useLocale();

  const currentLocale = locales.find(l => l.id === locale);

  const items = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/dictionary", icon: Search, label: "Dict" },
    { href: "/learn", icon: BookOpen, label: "Learn" },
    { href: "/journal", icon: PenTool, label: "Journal" },
    { href: "/situations", icon: MessageSquare, label: "Situations" },
    { href: "/trip-pack", icon: Package, label: "Pack" },
    { href: "/trails", icon: Footprints, label: "Trails" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border/40 pb-safe pt-2 px-4 z-50 md:top-0 md:left-0 md:bottom-0 md:w-64 md:border-r md:border-t-0 md:flex-col md:pt-8 md:px-4 md:h-screen">
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
                <item.icon className={cn("h-5 w-5 mb-1 md:mb-0 md:h-6 md:w-6", isActive && "stroke-[2.5px]")} />
                <span className="text-[9px] font-medium md:text-sm">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="hidden md:block mt-auto pt-4 border-t border-border/40">
        <div className="px-2 mb-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Region
          </span>
        </div>
        <Select value={locale} onValueChange={setLocale}>
          <SelectTrigger className="text-xs h-9 bg-muted/30 border-border/50" data-testid="nav-select-locale">
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            {locales.map((l) => (
              <SelectItem key={l.id} value={l.id} data-testid={`nav-locale-option-${l.id}`}>
                <div className="flex flex-col">
                  <span className="font-medium text-xs">{l.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {currentLocale && currentLocale.id !== "neutral" && (
          <p className="text-[10px] text-muted-foreground mt-1 px-1">{currentLocale.description}</p>
        )}
      </div>
    </nav>
  );
}
