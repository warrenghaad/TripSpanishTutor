import Layout from "@/components/layout";
import SentenceBuilder from "@/components/sentence-builder";
import { bodyParts, conditionalScenarios, commonVerbs } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, User, Brain, Hand, MapPin, ArrowRight, Utensils, DollarSign, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Learn() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'utensils': return Utensils;
      case 'activity': return Activity;
      case 'map-pin': return MapPin;
      case 'dollar-sign': return DollarSign;
      case 'shopping-bag': return ShoppingBag;
      default: return MapPin;
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Learning Center</h1>
          <p className="text-muted-foreground">Master specific categories and grammar rules.</p>
        </header>

        <Tabs defaultValue="scenarios" className="space-y-8">
          <TabsList className="bg-background border-b border-border w-full justify-start rounded-none h-auto p-0 gap-6 overflow-x-auto">
             <TabsTrigger 
              value="scenarios" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 py-3 font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              "Where would I go if..."
            </TabsTrigger>
            <TabsTrigger 
              value="body" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 py-3 font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              Body & Health
            </TabsTrigger>
             <TabsTrigger 
              value="verbs" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 py-3 font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              Travel Verbs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section>
              <div className="mb-6">
                 <h2 className="text-xl font-display font-bold flex items-center gap-2 text-foreground">
                  <MapPin className="w-5 h-5 text-primary" />
                  Problem Solving & Locations
                </h2>
                <p className="text-muted-foreground text-sm mt-1">Click a condition to see where you should go and what to say.</p>
              </div>
             
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {conditionalScenarios.map((scenario) => {
                    const Icon = getIcon(scenario.icon);
                    const isSelected = selectedScenario === scenario.id;
                    
                    return (
                      <Card 
                        key={scenario.id} 
                        onClick={() => setSelectedScenario(scenario.id)}
                        className={`p-4 cursor-pointer transition-all duration-200 hover:border-primary/50 flex items-center gap-4 ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'bg-white'}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-primary text-white' : 'bg-secondary/10 text-secondary'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{scenario.condition}</p>
                          <p className="text-sm text-muted-foreground">{scenario.spanishCondition}</p>
                        </div>
                        {isSelected && <ArrowRight className="w-4 h-4 text-primary ml-auto animate-pulse" />}
                      </Card>
                    );
                  })}
                </div>

                <div className="relative min-h-[300px]">
                   <AnimatePresence mode="wait">
                    {selectedScenario ? (
                      (() => {
                        const scenario = conditionalScenarios.find(s => s.id === selectedScenario)!;
                        const Icon = getIcon(scenario.icon);
                        return (
                          <motion.div
                            key={scenario.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full"
                          >
                            <Card className="h-full bg-secondary text-white p-8 flex flex-col justify-center items-center text-center relative overflow-hidden border-none shadow-xl">
                               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                               <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />
                               
                               <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 relative z-10">
                                 <Icon className="w-10 h-10 text-white" />
                               </div>

                               <h3 className="text-3xl font-display font-bold mb-2 relative z-10 text-white">
                                 {scenario.location}
                               </h3>
                               
                               <div className="w-12 h-1 bg-primary rounded-full mb-6 relative z-10" />
                               
                               <div className="space-y-2 relative z-10">
                                 <p className="text-white/60 text-sm uppercase tracking-widest font-bold">The Solution</p>
                                 <p className="text-2xl font-display font-medium">"{scenario.spanishAction}"</p>
                                 <p className="text-white/80 italic">({scenario.action})</p>
                               </div>
                            </Card>
                          </motion.div>
                        );
                      })()
                    ) : (
                      <div className="h-full flex items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-xl text-muted-foreground">
                        <p>Select a scenario on the left to practice.</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="body" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section>
              <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Vocabulary: Las Partes del Cuerpo
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {bodyParts.map((part) => (
                  <Card key={part.id} className="p-4 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary mb-3 group-hover:scale-110 transition-transform">
                      {/* Fallback icon logic */}
                      <Activity className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-foreground">{part.spanish}</p>
                    <p className="text-sm text-muted-foreground">{part.english}</p>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Practice: Expressing Feelings
              </h2>
              <SentenceBuilder />
            </section>
          </TabsContent>

          <TabsContent value="verbs" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <section>
              <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-primary" />
                Essential Travel Verbs
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {commonVerbs.filter(v => ['ir', 'necesitar', 'querer'].includes(v.id)).map((verb) => (
                  <Card key={verb.id} className="overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="bg-secondary p-4 text-white">
                      <h3 className="text-xl font-bold capitalize">{verb.spanish}</h3>
                      <p className="text-white/70 text-sm">{verb.english}</p>
                    </div>
                    <div className="p-4 space-y-3 bg-white">
                      <div className="flex justify-between items-center border-b border-border/50 pb-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Present (I)</span>
                        <span className="text-foreground font-medium">{verb.conjugations.present.yo}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-border/50 pb-2">
                         <span className="text-xs font-bold text-muted-foreground uppercase">Past (I)</span>
                        <span className="text-foreground font-medium">{verb.conjugations.past.yo}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-xs font-bold text-muted-foreground uppercase">Future (I)</span>
                        <span className="text-foreground font-medium">{verb.conjugations.future.yo}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="mt-8">
                 <h3 className="text-lg font-bold mb-4">Practice Sentences</h3>
                 <SentenceBuilder />
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
