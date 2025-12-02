import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface SituationCardProps {
  id: string;
  title: string;
  description: string;
  icon: any;
  delay?: number;
}

export default function SituationCard({ id, title, description, icon: Icon, delay = 0 }: SituationCardProps) {
  return (
    <Link href={`/situations/${id}`}>
      <a className="block h-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay, duration: 0.4 }}
          whileHover={{ y: -4 }}
        >
          <Card className="h-full p-5 overflow-hidden relative group hover:border-primary/50 transition-colors bg-white">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-primary">
              <Icon className="w-24 h-24 -mr-8 -mt-8" />
            </div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <Icon className="w-6 h-6" />
              </div>
              
              <h3 className="text-lg font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {title}
              </h3>
              
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-grow">
                {description}
              </p>
              
              <div className="flex items-center text-xs font-bold text-primary uppercase tracking-wider mt-auto">
                Start Practice <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Card>
        </motion.div>
      </a>
    </Link>
  );
}
