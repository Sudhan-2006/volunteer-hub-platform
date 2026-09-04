import { motion } from "framer-motion";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
       className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/20 bg-primary/[.025] p-10 text-center"
    >
       <div className="mb-4 rounded-2xl bg-primary/10 p-4 text-primary">
        {icon}
      </div>
       <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      {action}
    </motion.div>
  );
}
