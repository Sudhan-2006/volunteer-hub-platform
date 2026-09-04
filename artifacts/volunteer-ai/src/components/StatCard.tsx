import { ReactNode } from "react";
import { motion } from "framer-motion";
import { AnimatedNumber } from "./AnimatedNumber";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  accentClass?: string;
  delay?: number;
}

export function StatCard({ title, value, icon, accentClass = "text-primary", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="surface-shadow border-border/80">
        <CardContent className="flex items-center gap-3 p-4 sm:p-5">
          <div className={cn("rounded-xl p-2.5", accentClass)}>
            {icon}
          </div>
          <div>
            <p className="label-mono text-muted-foreground">{title}</p>
            <AnimatedNumber value={value} className="mt-1 text-2xl font-bold tracking-tight" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
