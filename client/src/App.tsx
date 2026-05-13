import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleProvider } from "@/lib/locale-context";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dictionary from "@/pages/dictionary";
import Learn from "@/pages/learn";
import Situations from "@/pages/situations";
import Journal from "@/pages/journal";
import TripPackPage from "@/pages/trip-pack";
import TrailsPage from "@/pages/trails";
import TranslatePage from "@/pages/translate";
import ChatPage from "@/pages/chat";
import GrowPage from "@/pages/grow";
import TranslatorPanel from "./components/translator-panel";

function Router() {
  return (
    <Switch>
      <Route path="/" component={TranslatePage} />
      <Route path="/home" component={Home} />
      <Route path="/chat/:id" component={ChatPage} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/grow/:id" component={GrowPage} />
      <Route path="/dictionary" component={Dictionary} />
      <Route path="/learn" component={Learn} />
      <Route path="/situations" component={Situations} />
      <Route path="/journal" component={Journal} />
      <Route path="/trip-pack" component={TripPackPage} />
      <Route path="/trails" component={TrailsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LocaleProvider>
          <Toaster />
          <Router />
          <TranslatorPanel />
        </LocaleProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
