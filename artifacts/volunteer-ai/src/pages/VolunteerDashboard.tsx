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
      <div className="p-8 flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Volunteer Dashboard</h1>
          <p className="text-muted-foreground mt-1">Find ways to help and track your impact.</p>
        </div>
        {dashboard.profile && (
          <Link href="/dashboard/volunteer/profile">
            <Button variant="outline" className="gap-2">
              <Award className="w-4 h-4" /> My Profile
            </Button>
          </Link>
        )}
      </div>

      {!dashboard.profile ? (
        <Card className="bg-teal-50 border-teal-200 shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
          <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="bg-teal-100 p-3 rounded-full text-teal-600">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-teal-900 mb-1">Complete your volunteer profile</h3>
                <p className="text-teal-800">You need to set up your profile before you can apply to help with requests. Tell us about your skills and availability.</p>
              </div>
            </div>
            <Link href="/dashboard/volunteer/profile">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white shrink-0">
                Set up profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard title="Active Roles" value={dashboard.counts.activeRoles} icon={<Award className="w-5 h-5" />} accentClass="text-teal-600 bg-teal-500/10" delay={0} />
            <StatCard title="Applications" value={dashboard.counts.applications} icon={<FileText className="w-5 h-5" />} accentClass="text-blue-600 bg-blue-500/10" delay={0.1} />
            <StatCard title="Accepted" value={dashboard.counts.accepted} icon={<CheckCircle2 className="w-5 h-5" />} accentClass="text-emerald-600 bg-emerald-500/10" delay={0.2} />
            <StatCard title="Rejected" value={dashboard.counts.rejected} icon={<XCircle className="w-5 h-5" />} accentClass="text-rose-600 bg-rose-500/10" delay={0.3} />
            <StatCard title="Available Requests" value={dashboard.counts.availableRequests} icon={<MapPin className="w-5 h-5" />} accentClass="text-purple-600 bg-purple-500/10" delay={0.4} />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-semibold tracking-tight">Available Requests</h2>
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
              <h2 className="text-2xl font-semibold tracking-tight">My Applications</h2>
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
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="font-semibold line-clamp-1">{app.request.title}</h3>
                              <Badge variant="outline" className={
                                app.status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                                app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' :
                                'bg-rose-500/10 text-rose-600'
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
