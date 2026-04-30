import { useGetAdminDashboard, getGetAdminDashboardQueryKey } from "@workspace/api-client-react";
import { Loader2, Users, HandHeart, FileText, Inbox, CheckCircle2, Activity } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatDistanceToNow } from "date-fns";

const COLORS = ['#f59e0b', '#10b981', '#6366f1', '#f43f5e', '#8b5cf6', '#0ea5e9'];

export default function AdminDashboard() {
  const { data: dashboard, isLoading } = useGetAdminDashboard({
    query: {
      queryKey: getGetAdminDashboardQueryKey(),
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
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform metrics and recent activity.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total Users" value={dashboard.totals.users} icon={<Users className="w-5 h-5" />} accentClass="text-amber-600 bg-amber-500/10" delay={0} />
        <StatCard title="Volunteers" value={dashboard.totals.volunteers} icon={<HandHeart className="w-5 h-5" />} accentClass="text-teal-600 bg-teal-500/10" delay={0.1} />
        <StatCard title="Requests" value={dashboard.totals.requests} icon={<FileText className="w-5 h-5" />} accentClass="text-indigo-600 bg-indigo-500/10" delay={0.2} />
        <StatCard title="Applications" value={dashboard.totals.applications} icon={<Inbox className="w-5 h-5" />} accentClass="text-blue-600 bg-blue-500/10" delay={0.3} />
        <StatCard title="Helps Approved" value={dashboard.totals.approvedHelps} icon={<CheckCircle2 className="w-5 h-5" />} accentClass="text-emerald-600 bg-emerald-500/10" delay={0.4} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="col-span-1 border-indigo-100 shadow-sm">
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

        <Card className="col-span-1 border-indigo-100 shadow-sm">
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

        <Card className="col-span-1 border-indigo-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Categories</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.categoryBreakdown} layout="vertical" margin={{ left: 30 }}>
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={80} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Top Volunteers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.topVolunteers.map((volunteer, i) => (
                <div key={volunteer.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-sm">
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

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {dashboard.recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="mt-0.5">
                    {activity.kind === 'request_created' && <div className="p-2 bg-amber-100 text-amber-600 rounded-full"><FileText className="w-4 h-4" /></div>}
                    {activity.kind === 'application_created' && <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><Inbox className="w-4 h-4" /></div>}
                    {activity.kind === 'application_decided' && <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full"><CheckCircle2 className="w-4 h-4" /></div>}
                    {(activity.kind === 'user_registered' || activity.kind === 'volunteer_registered') && <div className="p-2 bg-indigo-100 text-indigo-600 rounded-full"><Users className="w-4 h-4" /></div>}
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
