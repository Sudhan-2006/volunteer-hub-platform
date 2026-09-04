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
      <div className="mx-auto flex min-h-[50vh] max-w-6xl items-center justify-center p-8">
        <div className="space-y-3 text-center"><div className="mx-auto h-10 w-10 animate-pulse rounded-xl bg-primary/15" /><p className="label-mono text-muted-foreground">loading your hub</p></div>
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
    <div className="mx-auto max-w-6xl space-y-9 px-4 py-8 sm:px-6 lg:py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="label-mono text-primary">member space</span><h1 className="mt-2 text-3xl font-bold tracking-tight">Your neighborhood hub</h1>
          <p className="text-muted-foreground mt-1">Manage your requests and volunteer applications.</p>
        </div>
          <Link href="/dashboard/user/new" data-testid="link-post-request">
          <Button className="gap-2 bg-[#F9AB00] text-[#1E1E1E] hover:bg-[#F9AB00]/90">
            <Plus className="w-4 h-4" /> Post Request
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard title="Total Requests" value={dashboard.counts.total} icon={<FileText className="w-5 h-5" />} accentClass="text-[#946300] bg-[#F9AB00]/12" delay={0} />
        <StatCard title="Applications" value={dashboard.counts.applied} icon={<Inbox className="w-5 h-5" />} accentClass="text-blue-600 bg-blue-500/10" delay={0.1} />
        <StatCard title="Pending" value={dashboard.counts.pending} icon={<Clock className="w-5 h-5" />} accentClass="text-[#946300] bg-[#F9AB00]/12" delay={0.2} />
        <StatCard title="Accepted" value={dashboard.counts.accepted} icon={<CheckCircle2 className="w-5 h-5" />} accentClass="text-emerald-600 bg-emerald-500/10" delay={0.3} />
        <StatCard title="Rejected" value={dashboard.counts.rejected} icon={<XCircle className="w-5 h-5" />} accentClass="text-[#B52D25] bg-[#EA4335]/10" delay={0.4} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div><span className="label-mono text-muted-foreground">your activity</span><h2 className="mt-1 text-xl font-semibold tracking-tight">My requests</h2></div>
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
           <div><span className="label-mono text-muted-foreground">incoming support</span><h2 className="mt-1 text-xl font-semibold tracking-tight">Recent applications</h2></div>
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
                  <Card className="surface-shadow border-border/80">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{app.volunteer.name}</p>
                          <p className="text-sm text-muted-foreground">{app.volunteer.roleTitle}</p>
                        </div>
                          <Badge data-testid={`status-application-${app.id}`} variant="outline" className={
                           app.status === 'pending' ? 'bg-[#F9AB00]/12 text-[#946300]' :
                           app.status === 'approved' ? 'bg-[#34A853]/10 text-[#21833E]' :
                           'bg-[#EA4335]/10 text-[#B52D25]'
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
                            data-testid={`button-approve-application-${app.id}`} onClick={() => handleDecision(app.id, app.requestId, "approved")}
                            disabled={decideApplication.isPending}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 text-[#B52D25] hover:bg-[#EA4335]/10"
                            data-testid={`button-reject-application-${app.id}`} onClick={() => handleDecision(app.id, app.requestId, "rejected")}
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
