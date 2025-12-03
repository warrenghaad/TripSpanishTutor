import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { bodyParts, commonVerbs, adjectives, adverbs, Verb } from "@/lib/data";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SentenceBuilder() {
  const [selectedVerb, setSelectedVerb] = useState<string>(commonVerbs[0].id);
  const [selectedTense, setSelectedTense] = useState<keyof Verb['conjugations']>('present');
  const [selectedPerson, setSelectedPerson] = useState<'yo' | 'tu' | 'el'>('yo');
  
  // Object handling
  const [objectMode, setObjectMode] = useState<'list' | 'custom'>('list');
  const [selectedObject, setSelectedObject] = useState<string>(bodyParts[0].id);
  const [customObject, setCustomObject] = useState("");

  // Adjective handling
  const [adjMode, setAdjMode] = useState<'none' | 'list' | 'custom'>('none');
  const [selectedAdj, setSelectedAdj] = useState<string>(adjectives[0].id);
  const [customAdj, setCustomAdj] = useState("");

  // Adverb handling
  const [advMode, setAdvMode] = useState<'none' | 'list' | 'custom'>('none');
  const [selectedAdv, setSelectedAdv] = useState<string>(adverbs[0].id);
  const [customAdv, setCustomAdv] = useState("");

  const verb = commonVerbs.find(v => v.id === selectedVerb);
  const object = bodyParts.find(o => o.id === selectedObject);
  const adjective = adjectives.find(a => a.id === selectedAdj);
  const adverb = adverbs.find(a => a.id === selectedAdv);

  const conjugatedVerb = verb?.conjugations[selectedTense][selectedPerson];
  const isReflexive = verb?.id === 'doler';
  
  const objectString = objectMode === 'list' ? object?.spanish : customObject || "(noun)";
  const adjString = adjMode === 'list' ? adjective?.spanish : customAdj;
  const advString = advMode === 'list' ? adverb?.spanish : customAdv;

  // Construct sentence parts
  const parts = [
    !isReflexive ? personLabel(selectedPerson) : '',
    conjugatedVerb,
    objectString,
    adjMode !== 'none' ? adjString : '',
    advMode !== 'none' ? advString : ''
  ].filter(Boolean);

  const sentence = parts.join(' ');

  function personLabel(p: string) {
    if (p === 'yo') return 'Yo';
    if (p === 'tu') return 'Tú';
    if (p === 'el') return 'Él/Ella';
    return '';
  }

  return (
    <Card className="p-6 bg-white shadow-sm border-border/60">
      <div className="mb-6">
        <h3 className="text-lg font-display font-semibold text-secondary mb-2">Full Sentence Builder</h3>
        <p className="text-sm text-muted-foreground">Construct complex sentences with nouns, verbs, adjectives, and adverbs.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {/* 1. Person */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">1. Person</label>
          <Select value={selectedPerson} onValueChange={(v: any) => setSelectedPerson(v)}>
            <SelectTrigger className="bg-background border-border/60"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="yo">I (Yo)</SelectItem>
              <SelectItem value="tu">You (Tú)</SelectItem>
              <SelectItem value="el">He/She (Él/Ella)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 2. Verb & Tense */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">2. Verb</label>
          <div className="flex gap-1">
            <Select value={selectedVerb} onValueChange={setSelectedVerb}>
              <SelectTrigger className="bg-background border-border/60 flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {commonVerbs.map(v => (<SelectItem key={v.id} value={v.id}>{v.spanish}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={selectedTense} onValueChange={(v: any) => setSelectedTense(v)}>
              <SelectTrigger className="bg-background border-border/60 w-[80px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Pres</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="future">Fut</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 3. Noun/Object */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">3. Noun</label>
          <Tabs value={objectMode} onValueChange={(v: any) => setObjectMode(v)} className="w-full">
            <TabsList className="w-full h-6 bg-muted/50 p-0 mb-1">
              <TabsTrigger value="list" className="flex-1 text-[10px] h-full">List</TabsTrigger>
              <TabsTrigger value="custom" className="flex-1 text-[10px] h-full">Custom</TabsTrigger>
            </TabsList>
            {objectMode === 'list' ? (
              <Select value={selectedObject} onValueChange={setSelectedObject}>
                <SelectTrigger className="bg-background border-border/60"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {bodyParts.map(p => (<SelectItem key={p.id} value={p.id}>{p.spanish}</SelectItem>))}
                </SelectContent>
              </Select>
            ) : (
              <Input placeholder="noun..." value={customObject} onChange={(e) => setCustomObject(e.target.value)} className="h-10 bg-background" />
            )}
          </Tabs>
        </div>

        {/* 4. Adjective */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">4. Adjective</label>
          <Tabs value={adjMode} onValueChange={(v: any) => setAdjMode(v)} className="w-full">
            <TabsList className="w-full h-6 bg-muted/50 p-0 mb-1">
              <TabsTrigger value="none" className="flex-1 text-[10px] h-full">None</TabsTrigger>
              <TabsTrigger value="list" className="flex-1 text-[10px] h-full">List</TabsTrigger>
              <TabsTrigger value="custom" className="flex-1 text-[10px] h-full">Custom</TabsTrigger>
            </TabsList>
            {adjMode === 'list' ? (
              <Select value={selectedAdj} onValueChange={setSelectedAdj}>
                <SelectTrigger className="bg-background border-border/60"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {adjectives.map(a => (<SelectItem key={a.id} value={a.id}>{a.spanish} ({a.english})</SelectItem>))}
                </SelectContent>
              </Select>
            ) : adjMode === 'custom' ? (
              <Input placeholder="adj..." value={customAdj} onChange={(e) => setCustomAdj(e.target.value)} className="h-10 bg-background" />
            ) : (
              <div className="h-10 bg-muted/20 border border-border/40 rounded-md flex items-center justify-center text-xs text-muted-foreground">No adjective</div>
            )}
          </Tabs>
        </div>

        {/* 5. Adverb */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">5. Adverb</label>
          <Tabs value={advMode} onValueChange={(v: any) => setAdvMode(v)} className="w-full">
            <TabsList className="w-full h-6 bg-muted/50 p-0 mb-1">
              <TabsTrigger value="none" className="flex-1 text-[10px] h-full">None</TabsTrigger>
              <TabsTrigger value="list" className="flex-1 text-[10px] h-full">List</TabsTrigger>
              <TabsTrigger value="custom" className="flex-1 text-[10px] h-full">Custom</TabsTrigger>
            </TabsList>
            {advMode === 'list' ? (
              <Select value={selectedAdv} onValueChange={setSelectedAdv}>
                <SelectTrigger className="bg-background border-border/60"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {adverbs.map(a => (<SelectItem key={a.id} value={a.id}>{a.spanish} ({a.english})</SelectItem>))}
                </SelectContent>
              </Select>
            ) : advMode === 'custom' ? (
              <Input placeholder="adv..." value={customAdv} onChange={(e) => setCustomAdv(e.target.value)} className="h-10 bg-background" />
            ) : (
              <div className="h-10 bg-muted/20 border border-border/40 rounded-md flex items-center justify-center text-xs text-muted-foreground">No adverb</div>
            )}
          </Tabs>
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
            <h2 className="text-2xl md:text-3xl font-display font-bold text-secondary break-words max-w-full px-4">
              "{sentence}"
            </h2>
          </motion.div>
        </AnimatePresence>
        
        <p className="text-muted-foreground text-sm mb-4 max-w-lg">
           Translation: 
           {personLabel(selectedPerson)} {selectedTense === 'past' ? 'did' : selectedTense === 'future' ? 'will' : ''} {verb?.english} 
           {objectMode !== 'custom' ? ` the ${object?.english}` : ` ${customObject}`} 
           {adjMode !== 'none' ? ` (${adjMode === 'list' ? adjective?.english : customAdj})` : ''} 
           {advMode !== 'none' ? ` (${advMode === 'list' ? adverb?.english : customAdv})` : ''}
        </p>

        <Button size="sm" variant="outline" className="rounded-full gap-2 hover:text-primary hover:border-primary">
          <Volume2 className="w-4 h-4" />
          Pronounce
        </Button>
      </div>
    </Card>
  );
}
