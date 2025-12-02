import Layout from "@/components/layout";
import { situations } from "@/lib/data";
import SituationCard from "@/components/situation-card";
import { MapPin, Sun, Mic } from "lucide-react";

export default function Situations() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Situations</h1>
          <p className="text-muted-foreground">Real-world scripts for your trip.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {situations.map((situation, index) => (
            <div key={situation.id} className="h-[280px]">
              <SituationCard 
                {...situation} 
                icon={situation.id === 'taxi' ? MapPin : situation.id === 'hotel' ? Sun : Mic}
                delay={index * 0.05}
              />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
