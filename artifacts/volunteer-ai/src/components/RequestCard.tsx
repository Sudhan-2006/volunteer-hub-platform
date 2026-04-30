import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Activity } from "lucide-react";
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
    low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    high: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  };

  const statusColors = {
    open: "bg-blue-500/10 text-blue-600",
    in_progress: "bg-purple-500/10 text-purple-600",
    completed: "bg-emerald-500/10 text-emerald-600",
    cancelled: "bg-gray-500/10 text-gray-600",
  };

  const Content = (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow group">
      <CardContent className="p-5 flex-1">
        <div className="flex justify-between items-start mb-3 gap-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <Badge variant="outline" className={cn("shrink-0", urgencyColors[urgency])}>
            {urgency}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="bg-muted">
            {category}
          </Badge>
          <Badge variant="secondary" className={cn("capitalize", statusColors[status])}>
            {status.replace("_", " ")}
          </Badge>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground mt-auto">
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
