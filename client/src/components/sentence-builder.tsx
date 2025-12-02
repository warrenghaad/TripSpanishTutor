import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { bodyParts, commonVerbs, Verb } from "@/lib/data";
import { ArrowRight, RefreshCw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SentenceBuilder() {
  const [selectedVerb, setSelectedVerb] = useState<string>(commonVerbs[0].id);
  const [selectedTense, setSelectedTense] = useState<keyof Verb['conjugations']>('present');
  const [selectedPerson, setSelectedPerson] = useState<'yo' | 'tu' | 'el'>('yo');
  const [selectedObject, setSelectedObject] = useState<string>(bodyParts[0].id);

  const verb = commonVerbs.find(v => v.id === selectedVerb);
  const object = bodyParts.find(o => o.id === selectedObject);

  const conjugatedVerb = verb?.conjugations[selectedTense][selectedPerson];
  
  // Simple logic for "me duele" vs regular verbs
  const isReflexive = verb?.id === 'doler';
  
  const sentence = isReflexive 
    ? `${conjugatedVerb} ${object?.spanish}`
    : `${personLabel(selectedPerson)} ${conjugatedVerb} ${object?.spanish}`;

  function personLabel(p: string) {
    if (p === 'yo') return 'Yo';
    if (p === 'tu') return 'Tú';
    if (p === 'el') return 'Él/Ella';
    return '';
  }

  return (
    <Card className="p-6 bg-white shadow-sm border-border/60">
      <div className="mb-6">
        <h3 className="text-lg font-display font-semibold text-secondary mb-2">Sentence Builder</h3>
        <p className="text-sm text-muted-foreground">Mix and match to practice different tenses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Person</label>
          <Select value={selectedPerson} onValueChange={(v: any) => setSelectedPerson(v)}>
            <SelectTrigger className="bg-background border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yo">I (Yo)</SelectItem>
              <SelectItem value="tu">You (Tú)</SelectItem>
              <SelectItem value="el">He/She (Él/Ella)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Verb</label>
          <Select value={selectedVerb} onValueChange={setSelectedVerb}>
            <SelectTrigger className="bg-background border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {commonVerbs.map(v => (
                <SelectItem key={v.id} value={v.id}>{v.spanish} ({v.english})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tense</label>
          <Select value={selectedTense} onValueChange={(v: any) => setSelectedTense(v)}>
            <SelectTrigger className="bg-background border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="past">Past</SelectItem>
              <SelectItem value="future">Future</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Object (Body Part)</label>
          <Select value={selectedObject} onValueChange={setSelectedObject}>
            <SelectTrigger className="bg-background border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {bodyParts.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.spanish} ({p.english})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-secondary/5 rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent opacity-50" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={sentence}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-2"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold text-secondary">
              "{sentence}"
            </h2>
          </motion.div>
        </AnimatePresence>
        
        <p className="text-muted-foreground text-sm mb-4">
          {personLabel(selectedPerson)} {selectedTense === 'past' ? 'did' : 'will'} {verb?.english} {selectedTense === 'present' ? '' : ''} the {object?.english}
        </p>

        <Button size="sm" variant="outline" className="rounded-full gap-2 hover:text-primary hover:border-primary">
          <Volume2 className="w-4 h-4" />
          Pronounce
        </Button>
      </div>
    </Card>
  );
}
