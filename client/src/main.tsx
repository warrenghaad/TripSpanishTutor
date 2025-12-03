import { createRoot } from "react-dom/client";
import App from "./App";
import ChatWidget from "./components/chat-widget";
import TranslatorPanel from "./components/translator-panel";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <ChatWidget />
    <TranslatorPanel />
  </>
);
