import { useGetVolunteerDashboard, getGetVolunteerDashboardQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Loader2, ShieldAlert, Award, FileText, CheckCircle2, XCircle, Clock, MapPin } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { RequestCard } from "@/components/RequestCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export default function VolunteerDashboard() {
  const { data: dashboard, isLoading } = useGetVolunteerDashboard({
    query: {
      queryKey: getGetVolunteerDashboardQueryKey(),
    }
  });

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-6xl items-center justify-center p-8">
        <div className="space-y-3 text-center"><div className="mx-auto h-10 w-10 animate-pulse rounded-xl bg-[#34A853]/15" /><p className="label-mono text-muted-foreground">loading your opportunities</p></div>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-9 px-4 py-8 sm:px-6 lg:py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="label-mono text-[#21833E]">volunteer space</span><h1 className="mt-2 text-3xl font-bold tracking-tight">Your next good deed</h1>
          <p className="text-muted-foreground mt-1">Find ways to help and track your impact.</p>
        </div>
        {dashboard.profile && (
          <Link href="/dashboard/volunteer/profile" data-testid="link-volunteer-profile">
              <Button variant="outline" className="gap-2 border-[#34A853]/30 text-[#21833E] hover:bg-[#34A853]/10">
              <Award className="w-4 h-4" /> My Profile
            </Button>
          </Link>
        )}
      </div>

      {!dashboard.profile ? (
          <Card className="relative overflow-hidden border-[#34A853]/25 bg-[#34A853]/[.07] shadow-sm">
          <div className="absolute left-0 top-0 h-full w-1 bg-[#34A853]"></div>
          <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-[#34A853]/15 p-3 text-[#21833E]">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="mb-1 text-xl font-semibold text-[#1E1E1E]">Complete your volunteer profile</h3>
                <p className="text-[#285E39]">You need to set up your profile before you can apply to help with requests. Tell us about your skills and availability.</p>
              </div>
            </div>
            <Link href="/dashboard/volunteer/profile">
              <Button className="shrink-0 bg-[#34A853] text-white hover:bg-[#21833E]">
                Set up profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <StatCard title="Active Roles" value={dashboard.counts.activeRoles} icon={<Award className="w-5 h-5" />} accentClass="text-[#21833E] bg-[#34A853]/10" delay={0} />
            <StatCard title="Applications" value={dashboard.counts.applications} icon={<FileText className="w-5 h-5" />} accentClass="text-blue-600 bg-blue-500/10" delay={0.1} />
            <StatCard title="Accepted" value={dashboard.counts.accepted} icon={<CheckCircle2 className="w-5 h-5" />} accentClass="text-emerald-600 bg-emerald-500/10" delay={0.2} />
            <StatCard title="Rejected" value={dashboard.counts.rejected} icon={<XCircle className="w-5 h-5" />} accentClass="text-[#B52D25] bg-[#EA4335]/10" delay={0.3} />
            <StatCard title="Available Requests" value={dashboard.counts.availableRequests} icon={<MapPin className="w-5 h-5" />} accentClass="text-[#2563C4] bg-[#4285F4]/10" delay={0.4} />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
               <div><span className="label-mono text-muted-foreground">open nearby</span><h2 className="mt-1 text-xl font-semibold tracking-tight">Available requests</h2></div>
              {dashboard.availableRequests.length === 0 ? (
                <EmptyState 
                  icon={<MapPin className="w-8 h-8" />}
                  title="No requests nearby"
                  description="There are currently no open requests in your area. Check back later!"
                />
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {dashboard.availableRequests.map((request, i) => (
                    <RequestCard 
                      key={request.id}
                      {...request}
                      linkHref={`/dashboard/volunteer/requests/${request.id}`}
                      delay={i * 0.1}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
               <div><span className="label-mono text-muted-foreground">your commitments</span><h2 className="mt-1 text-xl font-semibold tracking-tight">My applications</h2></div>
              {dashboard.recentApplications.length === 0 ? (
                <EmptyState 
                  icon={<FileText className="w-8 h-8" />}
                  title="No applications"
                  description="You haven't applied to help with any requests yet."
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
                      <Link href={`/dashboard/volunteer/requests/${app.request.id}`}>
                          <Card className="surface-shadow border-border/80 transition-colors hover:bg-muted/50">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="font-semibold line-clamp-1">{app.request.title}</h3>
                               <Badge data-testid={`status-my-application-${app.id}`} variant="outline" className={
                                 app.status === 'pending' ? 'bg-[#F9AB00]/12 text-[#946300]' :
                                 app.status === 'approved' ? 'bg-[#34A853]/10 text-[#21833E]' :
                                 'bg-[#EA4335]/10 text-[#B52D25]'
                              }>
                                {app.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4 shrink-0" />
                              <span className="truncate">{app.request.cityArea}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Applied {formatDistanceToNow(new Date(app.createdAt))} ago
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
