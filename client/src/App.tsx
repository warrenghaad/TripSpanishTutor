import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dictionary from "@/pages/dictionary";
import Learn from "@/pages/learn";
import Situations from "@/pages/situations";
import Journal from "@/pages/journal";
import ChatWidget from "./components/chat-widget";
import TranslatorPanel from "./components/translator-panel";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dictionary" component={Dictionary} />
      <Route path="/learn" component={Learn} />
      <Route path="/situations" component={Situations} />
      <Route path="/journal" component={Journal} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <ChatWidget />
        <TranslatorPanel />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
