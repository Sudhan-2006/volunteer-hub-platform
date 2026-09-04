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
      <div className="mx-auto flex min-h-[50vh] items-center justify-center p-8">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-primary/15" />
      </div>
    );
  }

  if (!detail) return <div className="p-8">User not found</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-9 px-4 py-8 sm:px-6 lg:py-10">
      <Link href="/dashboard/admin/users" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Users
      </Link>

      <Card className="surface-shadow overflow-hidden border-[#F9AB00]/25 bg-[#F9AB00]/[.07]">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="mb-2 text-3xl font-bold">{detail.user.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {detail.user.email}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined {format(new Date(detail.user.createdAt), "MMM yyyy")}</span>
              </div>
            </div>
            
            <div className="flex gap-4">
                <div className="rounded-xl border border-[#F9AB00]/20 bg-card p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-[#946300]">{detail.user.totalRequests}</div>
                <div className="label-mono mt-1 text-[#946300]">Requests</div>
              </div>
                <div className="rounded-xl border border-[#34A853]/20 bg-card p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-[#21833E]">{detail.user.completedRequests}</div>
                <div className="label-mono mt-1 text-[#21833E]">Completed</div>
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
