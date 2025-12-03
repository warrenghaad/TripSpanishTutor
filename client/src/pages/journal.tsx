import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Send, Book, Sparkles, ArrowRight, History, Clock, Info } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Feedback = {
  corrected: string;
  corrections: { original: string, fixed: string, explanation: string }[];
  vocab: { word: string, translation: string }[];
};

export default function Journal() {
  const [text, setText] = useState("");
  const [tenseFocus, setTenseFocus] = useState("past");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleTranslate = () => {
    if (!text) return;
    setIsAnalyzing(true);
    
    // Simulate API delay
    setTimeout(() => {
      setFeedback({
        corrected: "Hoy fui a la playa y me gustó mucho. Mañana iré a las montañas.",
        corrections: [
          { 
            original: "go to beach", 
            fixed: "fui a la playa", 
            explanation: "Use 'fui' (I went) for completed past actions." 
          },
          { 
            original: "I like it", 
            fixed: "me gustó", 
            explanation: "In past tense, 'gustar' becomes 'gustó' (it pleased me)." 
          }
        ],
        vocab: [
          { word: "la montaña", translation: "mountain" },
          { word: "la arena", translation: "sand" },
          { word: "las olas", translation: "waves" }
        ]
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Travel Journal</h1>
          <p className="text-muted-foreground">Practice your past and future tenses describing your day.</p>
        </header>

        <div className="grid gap-6">
          <Card className="p-6 space-y-4 border-primary/20 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <label className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Focus Tense:</label>
                <Select value={tenseFocus} onValueChange={setTenseFocus}>
                  <SelectTrigger className="w-[140px] h-8 text-xs font-bold uppercase tracking-wider bg-secondary/10 border-0 text-secondary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="past">Past (Yesterday)</SelectItem>
                    <SelectItem value="future">Future (Tomorrow)</SelectItem>
                    <SelectItem value="present">Present (Now)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="sm" className="text-primary self-end md:self-auto">
                <Mic className="w-4 h-4 mr-2" />
                Dictate
              </Button>
            </div>
            
            <Textarea 
              placeholder={tenseFocus === 'past' ? "Yesterday I went to... (Ayer fui a...)" : "Tomorrow I will go to... (Mañana iré a...)"}
              className="min-h-[150px] text-lg font-sans bg-background border-border/60 focus:border-primary/50 resize-none p-4"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            
            <div className="flex justify-end">
              <Button 
                onClick={handleTranslate} 
                disabled={isAnalyzing || !text}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isAnalyzing ? (
                  <span className="flex items-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"/> Analyzing...</span>
                ) : (
                  <span className="flex items-center"><Sparkles className="w-4 h-4 mr-2" /> Check My Grammar</span>
                )}
              </Button>
            </div>
          </Card>

          <AnimatePresence>
            {feedback && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Correction Card */}
                <Card className="p-6 bg-white border-l-4 border-l-primary shadow-lg overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-primary">
                    <Book className="w-32 h-32 -mr-8 -mt-8" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4 text-primary">
                      <Sparkles className="w-5 h-5" />
                      <h3 className="font-display font-bold text-lg">Polished Entry</h3>
                    </div>
                    
                    <p className="text-xl md:text-2xl font-display text-foreground leading-relaxed mb-6">
                      {feedback.corrected}
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-dashed border-border">
                      <div>
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Info className="w-3 h-3" /> Grammar Fixes
                        </h4>
                        <ul className="space-y-3">
                          {feedback.corrections.map((correction, idx) => (
                            <li key={idx} className="text-sm group">
                              <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-red-400 line-through decoration-red-400/50 decoration-2">{correction.original}</span>
                                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                <span className="text-green-600 font-bold bg-green-50 px-1 rounded">{correction.fixed}</span>
                              </div>
                              <p className="text-muted-foreground text-xs pl-4 border-l-2 border-border group-hover:border-primary/30 transition-colors">
                                {correction.explanation}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Book className="w-3 h-3" /> New Vocabulary
                        </h4>
                         <div className="grid grid-cols-2 gap-2">
                          {feedback.vocab.map((v, idx) => (
                            <div key={idx} className="bg-secondary/5 p-2 rounded-lg flex flex-col">
                              <span className="font-bold text-secondary text-sm">{v.word}</span>
                              <span className="text-muted-foreground text-xs">{v.translation}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
