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
      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <div className={cn("p-3 rounded-full bg-muted/50", accentClass)}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <AnimatedNumber value={value} className="text-2xl font-bold" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
