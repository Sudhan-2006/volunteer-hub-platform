import { useGetAdminDashboard, getGetAdminDashboardQueryKey } from "@workspace/api-client-react";
import { Loader2, Users, HandHeart, FileText, Inbox, CheckCircle2, Activity } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatDistanceToNow } from "date-fns";

const COLORS = ['#4285F4', '#34A853', '#F9AB00', '#EA4335', '#1E1E1E', '#6B9DF8'];

export default function AdminDashboard() {
  const { data: dashboard, isLoading } = useGetAdminDashboard({
    query: {
      queryKey: getGetAdminDashboardQueryKey(),
    }
  });

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-7xl items-center justify-center p-8">
        <div className="space-y-3 text-center"><div className="mx-auto h-10 w-10 animate-pulse rounded-xl bg-primary/15" /><p className="label-mono text-muted-foreground">assembling the network view</p></div>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="mx-auto max-w-7xl space-y-9 px-4 py-8 sm:px-6 lg:py-10">
      <div>
        <span className="label-mono text-primary">network operations</span><h1 className="mt-2 text-3xl font-bold tracking-tight">A healthy community at a glance</h1>
        <p className="text-muted-foreground mt-1">Platform metrics and recent activity.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard title="Total Users" value={dashboard.totals.users} icon={<Users className="w-5 h-5" />} accentClass="text-[#946300] bg-[#F9AB00]/12" delay={0} />
        <StatCard title="Volunteers" value={dashboard.totals.volunteers} icon={<HandHeart className="w-5 h-5" />} accentClass="text-[#21833E] bg-[#34A853]/10" delay={0.1} />
        <StatCard title="Requests" value={dashboard.totals.requests} icon={<FileText className="w-5 h-5" />} accentClass="text-[#2563C4] bg-[#4285F4]/10" delay={0.2} />
        <StatCard title="Applications" value={dashboard.totals.applications} icon={<Inbox className="w-5 h-5" />} accentClass="text-blue-600 bg-blue-500/10" delay={0.3} />
        <StatCard title="Helps Approved" value={dashboard.totals.approvedHelps} icon={<CheckCircle2 className="w-5 h-5" />} accentClass="text-emerald-600 bg-emerald-500/10" delay={0.4} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
         <Card className="surface-shadow col-span-1 border-border/80">
          <CardHeader>
            <CardTitle className="text-lg">Request Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboard.requestStatusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {dashboard.requestStatusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

         <Card className="surface-shadow col-span-1 border-border/80">
          <CardHeader>
            <CardTitle className="text-lg">Application Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboard.applicationStatusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {dashboard.applicationStatusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

         <Card className="surface-shadow col-span-1 border-border/80">
          <CardHeader>
            <CardTitle className="text-lg">Categories</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.categoryBreakdown} layout="vertical" margin={{ left: 30 }}>
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={80} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
               <Bar dataKey="count" fill="#4285F4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
         <Card className="surface-shadow">
          <CardHeader>
            <CardTitle>Top Volunteers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.topVolunteers.map((volunteer, i) => (
                <div key={volunteer.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#34A853]/12 text-sm font-bold text-[#21833E]">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{volunteer.name}</p>
                      <p className="text-xs text-muted-foreground">{volunteer.roleTitle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">{volunteer.completedHelps}</p>
                    <p className="text-xs text-muted-foreground">Helps</p>
                  </div>
                </div>
              ))}
              {dashboard.topVolunteers.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No data yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

         <Card className="surface-shadow">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {dashboard.recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="mt-0.5">
                    {activity.kind === 'request_created' && <div className="rounded-full bg-[#F9AB00]/12 p-2 text-[#946300]"><FileText className="w-4 h-4" /></div>}
                    {activity.kind === 'application_created' && <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><Inbox className="w-4 h-4" /></div>}
                    {activity.kind === 'application_decided' && <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full"><CheckCircle2 className="w-4 h-4" /></div>}
                    {(activity.kind === 'user_registered' || activity.kind === 'volunteer_registered') && <div className="rounded-full bg-[#4285F4]/12 p-2 text-[#2563C4]"><Users className="w-4 h-4" /></div>}
                  </div>
                  <div>
                    <p className="text-sm"><span className="font-semibold">{activity.actorName}</span> {activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(activity.createdAt))} ago</p>
                  </div>
                </div>
              ))}
              {dashboard.recentActivity.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No activity yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
