import { useAdminGetUser, getAdminGetUserQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Loader2, ArrowLeft, Mail, Calendar, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RequestCard } from "@/components/RequestCard";
import { format } from "date-fns";

export default function AdminUserDetail({ id }: { id: number }) {
  const { data: detail, isLoading } = useAdminGetUser(id, {
    query: { queryKey: getAdminGetUserQueryKey(id), enabled: !!id }
  });

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!detail) return <div className="p-8">User not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      <Link href="/dashboard/admin/users" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Users
      </Link>

      <Card className="border-amber-200 shadow-sm overflow-hidden bg-gradient-to-r from-amber-50 to-white">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-amber-900 mb-2">{detail.user.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-amber-800/80">
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {detail.user.email}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined {format(new Date(detail.user.createdAt), "MMM yyyy")}</span>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-white p-4 rounded-xl border border-amber-100 text-center min-w-[100px] shadow-sm">
                <div className="text-2xl font-bold text-amber-700">{detail.user.totalRequests}</div>
                <div className="text-xs text-amber-600 uppercase tracking-wider font-semibold mt-1">Requests</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-emerald-100 text-center min-w-[100px] shadow-sm">
                <div className="text-2xl font-bold text-emerald-700">{detail.user.completedRequests}</div>
                <div className="text-xs text-emerald-600 uppercase tracking-wider font-semibold mt-1">Completed</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Requests History</h2>
        
        {detail.requests.length === 0 ? (
          <div className="text-center p-12 border border-dashed rounded-xl bg-muted/20">
            <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No requests yet</h3>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {detail.requests.map((req, i) => (
              <RequestCard key={req.id} {...req} delay={i * 0.1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
