import { useLocation } from "wouter";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { situations } from "@/lib/data";
import SituationCard from "@/components/situation-card";
import { ArrowRight, Sun, MapPin, Mic } from "lucide-react";
import generatedImage from '@assets/generated_images/vibrant_puerto_vallarta_street_illustration.png';

export default function Home() {
  const [_, setLocation] = useLocation();

  return (
    <Layout>
      <div className="relative w-full h-[300px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
        <img 
          src={generatedImage} 
          alt="Puerto Vallarta Streets" 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center space-x-2 text-primary mb-2 font-medium">
              <MapPin className="w-4 h-4" />
              <span>Puerto Vallarta, Mexico</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">
              Buenos días, Traveler
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Ready to explore? Let's practice your Spanish for today's adventures.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-10">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold">Quick Start</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              onClick={() => setLocation('/learn')}
              className="bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl p-6 text-white cursor-pointer hover:shadow-lg hover:shadow-secondary/20 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-4">
                <Sun className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold mb-1">Daily Essentials</h3>
              <p className="text-white/80 text-sm mb-4">Practice the core vocabulary you'll need today.</p>
              <Button variant="secondary" className="bg-white text-secondary hover:bg-white/90 w-full">
                Start Learning
              </Button>
            </div>

            <div 
              onClick={() => setLocation('/journal')}
              className="bg-white border border-border rounded-2xl p-6 cursor-pointer hover:border-primary/50 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold mb-1 text-foreground">Speak & Journal</h3>
              <p className="text-muted-foreground text-sm mb-4">Record your day in Spanglish and we'll help translate.</p>
              <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/5">
                Open Journal
              </Button>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold">Practice Situations</h2>
            <Button variant="ghost" className="text-primary hover:text-primary/80" onClick={() => setLocation('/situations')}>
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {situations.map((situation, index) => (
              <SituationCard 
                key={situation.id} 
                {...situation} 
                icon={situation.id === 'taxi' ? MapPin : situation.id === 'hotel' ? Sun : Mic} // Fallback icons just in case 
                delay={index * 0.1}
              />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
