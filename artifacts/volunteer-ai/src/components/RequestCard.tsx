import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Urgency, RequestStatus } from "@workspace/api-client-react";
import { ReactNode } from "react";

interface RequestCardProps {
  id: number;
  title: string;
  category: string;
  urgency: Urgency;
  cityArea: string;
  status: RequestStatus;
  applicationsCount: number;
  linkHref?: string;
  actionNode?: ReactNode;
  delay?: number;
}

export function RequestCard({
  id,
  title,
  category,
  urgency,
  cityArea,
  status,
  applicationsCount,
  linkHref,
  actionNode,
  delay = 0,
}: RequestCardProps) {
  const urgencyColors = {
    low: "bg-[#34A853]/10 text-[#21833E] border-[#34A853]/25",
    medium: "bg-[#F9AB00]/12 text-[#946300] border-[#F9AB00]/25",
    high: "bg-[#EA4335]/10 text-[#B52D25] border-[#EA4335]/25",
  };

  const statusColors = {
    open: "bg-[#4285F4]/10 text-[#2563C4]",
    in_progress: "bg-[#F9AB00]/12 text-[#946300]",
    completed: "bg-[#34A853]/10 text-[#21833E]",
    cancelled: "bg-muted text-muted-foreground",
  };

  const Content = (
    <Card className="surface-shadow h-full flex flex-col overflow-hidden border-border/80 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg">
      <CardContent className="flex-1 p-5">
        <div className="mb-5 flex items-center justify-between"><span className="label-mono text-muted-foreground">request / {String(id).padStart(3, "0")}</span><ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div>
        <div className="flex justify-between items-start mb-3 gap-2">
           <h3 className="line-clamp-2 text-[17px] font-semibold leading-snug group-hover:text-primary transition-colors">
            {title}
          </h3>
          <Badge variant="outline" className={cn("shrink-0", urgencyColors[urgency])}>
            {urgency}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
             <Badge variant="secondary" className="bg-muted/80 text-muted-foreground">
            {category}
          </Badge>
          <Badge variant="secondary" className={cn("capitalize", statusColors[status])}>
            {status.replace("_", " ")}
          </Badge>
        </div>
           <div className="mt-6 space-y-2.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{cityArea}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 shrink-0" />
            <span>{applicationsCount} applications</span>
          </div>
        </div>
      </CardContent>
      {actionNode && (
        <CardFooter className="p-5 pt-0 mt-auto">
          {actionNode}
        </CardFooter>
      )}
    </Card>
  );

  const wrapper = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="h-full"
    >
      {Content}
    </motion.div>
  );

  if (linkHref) {
    return (
      <Link href={linkHref} className="block h-full outline-none">
        {wrapper}
      </Link>
    );
  }

  return wrapper;
}
