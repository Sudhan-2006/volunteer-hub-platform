import { useAdminGetVolunteer, getAdminGetVolunteerQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Loader2, ArrowLeft, Mail, Phone, MapPin, Award, Star, Clock, Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

export default function AdminVolunteerDetail({ id }: { id: number }) {
  const { data: detail, isLoading } = useAdminGetVolunteer(id, {
    query: { queryKey: getAdminGetVolunteerQueryKey(id), enabled: !!id }
  });

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[50vh] items-center justify-center p-8">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-[#34A853]/15" />
      </div>
    );
  }

  if (!detail) return <div className="p-8">Volunteer not found</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-9 px-4 py-8 sm:px-6 lg:py-10">
      <Link href="/dashboard/admin/volunteers" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Volunteers
      </Link>

      <Card className="surface-shadow overflow-hidden border-[#34A853]/25 bg-[#34A853]/[.07]">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{detail.volunteer.name}</h1>
                  <Badge className="bg-[#34A853]">{detail.profile.roleTitle}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                  <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {detail.volunteer.email}</span>
                  <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {detail.profile.phone}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {detail.profile.cityArea}</span>
                </div>
              </div>

              <div className="bg-white/60 p-4 rounded-lg border border-teal-100">
                <p className="italic text-foreground/75">"{detail.profile.bio}"</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {detail.profile.skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="border-[#34A853]/20 bg-[#34A853]/[.08] text-[#21833E]">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 min-w-[240px]">
              <div className="bg-white p-4 rounded-xl border border-teal-100 text-center shadow-sm">
                <div className="mb-1 flex justify-center text-[#F9AB00]"><Star className="h-5 w-5 fill-current" /></div>
                <div className="text-xl font-bold">{detail.profile.rating.toFixed(1)}</div>
                <div className="label-mono text-[#21833E]">Rating</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-teal-100 text-center shadow-sm">
                <div className="mb-1 flex justify-center text-[#34A853]"><Award className="h-5 w-5" /></div>
                <div className="text-xl font-bold">{detail.volunteer.approved}</div>
                <div className="label-mono text-[#21833E]">Approved</div>
              </div>
              <div className="col-span-2 bg-white p-4 rounded-xl border border-teal-100 text-center shadow-sm flex items-center justify-between px-6">
                <span className="label-mono text-[#21833E]">Experience</span>
                <span className="text-lg font-bold">{detail.profile.experienceYears} Years</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Applications History</h2>
        
        {detail.applications.length === 0 ? (
          <div className="text-center p-12 border border-dashed rounded-xl bg-muted/20">
            <Inbox className="w-10 h-10 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No applications yet</h3>
          </div>
        ) : (
          <div className="grid gap-4">
            {detail.applications.map((app, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card>
                  <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{app.request.title}</h3>
                        <Badge variant="outline" className={
                          app.status === 'pending' ? 'bg-[#F9AB00]/12 text-[#946300] border-[#F9AB00]/25' :
                          app.status === 'approved' ? 'bg-[#34A853]/10 text-[#21833E] border-[#34A853]/25' :
                          'bg-[#EA4335]/10 text-[#B52D25] border-[#EA4335]/25'
                        }>
                          {app.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2 bg-muted/50 p-2 rounded italic">"{app.message}"</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {app.request.cityArea}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Applied {formatDistanceToNow(new Date(app.createdAt))} ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
