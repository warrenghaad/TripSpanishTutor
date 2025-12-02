import Layout from "@/components/layout";
import SentenceBuilder from "@/components/sentence-builder";
import { bodyParts } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, User, Brain, Hand } from "lucide-react";

export default function Learn() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Learning Center</h1>
          <p className="text-muted-foreground">Master specific categories and grammar rules.</p>
        </header>

        <Tabs defaultValue="body" className="space-y-8">
          <TabsList className="bg-background border-b border-border w-full justify-start rounded-none h-auto p-0 gap-6">
            <TabsTrigger 
              value="body" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 py-3 font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Body & Health
            </TabsTrigger>
            <TabsTrigger 
              value="colors" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 py-3 font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Colors & Clothes
            </TabsTrigger>
            <TabsTrigger 
              value="slang" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 py-3 font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Local Slang
            </TabsTrigger>
          </TabsList>

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

          <TabsContent value="colors">
            <div className="p-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
              Colors & Clothes module coming soon.
            </div>
          </TabsContent>
          
          <TabsContent value="slang">
             <div className="p-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
              Slang module coming soon.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
