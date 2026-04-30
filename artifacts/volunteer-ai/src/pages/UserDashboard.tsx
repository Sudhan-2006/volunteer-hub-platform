import { useGetUserDashboard, getGetUserDashboardQueryKey, useDecideApplication, getGetRequestQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { StatCard } from "@/components/StatCard";
import { RequestCard } from "@/components/RequestCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { FileText, CheckCircle2, XCircle, Plus, Clock, Inbox, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export default function UserDashboard() {
  const queryClient = useQueryClient();
  const { data: dashboard, isLoading } = useGetUserDashboard({
    query: {
      queryKey: getGetUserDashboardQueryKey(),
    }
  });

  const decideApplication = useDecideApplication();

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!dashboard) return null;

  const handleDecision = (applicationId: number, requestId: number, decision: "approved" | "rejected") => {
    decideApplication.mutate({ id: applicationId, data: { decision } }, {
      onSuccess: () => {
        toast.success(`Application ${decision}`);
        queryClient.invalidateQueries({ queryKey: getGetUserDashboardQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRequestQueryKey(requestId) });
      },
      onError: () => {
        toast.error(`Failed to ${decision} application`);
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your requests and volunteer applications.</p>
        </div>
        <Link href="/dashboard/user/new">
          <Button className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="w-4 h-4" /> Post Request
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total Requests" value={dashboard.counts.total} icon={<FileText className="w-5 h-5" />} accentClass="text-amber-600 bg-amber-500/10" delay={0} />
        <StatCard title="Applications" value={dashboard.counts.applied} icon={<Inbox className="w-5 h-5" />} accentClass="text-blue-600 bg-blue-500/10" delay={0.1} />
        <StatCard title="Pending" value={dashboard.counts.pending} icon={<Clock className="w-5 h-5" />} accentClass="text-purple-600 bg-purple-500/10" delay={0.2} />
        <StatCard title="Accepted" value={dashboard.counts.accepted} icon={<CheckCircle2 className="w-5 h-5" />} accentClass="text-emerald-600 bg-emerald-500/10" delay={0.3} />
        <StatCard title="Rejected" value={dashboard.counts.rejected} icon={<XCircle className="w-5 h-5" />} accentClass="text-rose-600 bg-rose-500/10" delay={0.4} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">My Requests</h2>
          {dashboard.recentRequests.length === 0 ? (
            <EmptyState 
              icon={<FileText className="w-8 h-8" />}
              title="No requests yet"
              description="Post your first request to get help from local volunteers."
              action={
                <Link href="/dashboard/user/new">
                  <Button variant="outline" className="mt-4">Create Request</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {dashboard.recentRequests.map((request, i) => (
                <RequestCard 
                  key={request.id}
                  {...request}
                  linkHref={`/dashboard/user/requests/${request.id}`}
                  delay={i * 0.1}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Recent Applications</h2>
          {dashboard.recentApplications.length === 0 ? (
            <EmptyState 
              icon={<Inbox className="w-8 h-8" />}
              title="No applications"
              description="Applications to your requests will appear here."
            />
          ) : (
            <div className="space-y-4">
              {dashboard.recentApplications.map((app, i) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{app.volunteer.name}</p>
                          <p className="text-sm text-muted-foreground">{app.volunteer.roleTitle}</p>
                        </div>
                        <Badge variant="outline" className={
                          app.status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                          app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' :
                          'bg-rose-500/10 text-rose-600'
                        }>
                          {app.status}
                        </Badge>
                      </div>
                      <p className="text-sm line-clamp-2 text-muted-foreground bg-muted/50 p-2 rounded-md italic">
                        "{app.message}"
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Applied {formatDistanceToNow(new Date(app.createdAt))} ago
                      </div>
                      
                      {app.status === 'pending' && (
                        <div className="flex gap-2 pt-2">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleDecision(app.id, app.requestId, "approved")}
                            disabled={decideApplication.isPending}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 text-rose-600 hover:bg-rose-50"
                            onClick={() => handleDecision(app.id, app.requestId, "rejected")}
                            disabled={decideApplication.isPending}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
