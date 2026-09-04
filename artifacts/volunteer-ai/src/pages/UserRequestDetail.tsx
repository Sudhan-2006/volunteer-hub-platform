import { useGetRequest, getGetRequestQueryKey, useDecideApplication, getGetUserDashboardQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, ArrowLeft, MapPin, Clock, Calendar, CheckCircle2, XCircle, Phone, Star, Award, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function UserRequestDetail({ id }: { id: number }) {
  const queryClient = useQueryClient();
  const { data: request, isLoading } = useGetRequest(id, {
    query: { queryKey: getGetRequestQueryKey(id), enabled: !!id }
  });

  const decideApplication = useDecideApplication();

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[50vh] items-center justify-center p-8">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-primary/15" />
      </div>
    );
  }

  if (!request) return <div className="p-8">Request not found</div>;

  const handleDecision = (applicationId: number, decision: "approved" | "rejected") => {
    decideApplication.mutate({ id: applicationId, data: { decision } }, {
      onSuccess: () => {
        toast.success(`Application ${decision}`);
        queryClient.invalidateQueries({ queryKey: getGetRequestQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getGetUserDashboardQueryKey() });
      },
      onError: () => {
        toast.error(`Failed to ${decision} application`);
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-9 px-4 py-8 sm:px-6 lg:py-10">
      <Link href="/dashboard/user" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="surface-shadow overflow-hidden rounded-2xl border border-border/80 bg-card">
        <div className="border-b border-border/70 bg-primary/[.045] p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant="secondary">{request.category}</Badge>
            <Badge variant="outline" className={
              request.urgency === 'high' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
              request.urgency === 'medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
              'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
            }>
              {request.urgency} urgency
            </Badge>
            <Badge variant="outline" className="capitalize bg-blue-500/10 text-blue-600 border-blue-500/20">
              {request.status.replace("_", " ")}
            </Badge>
          </div>
          
          <h1 className="mb-2 text-3xl font-bold tracking-tight">{request.title}</h1>
          <p className="text-xl text-muted-foreground">{request.purpose}</p>
        </div>

        <div className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{request.description}</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span>{request.cityArea}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="w-5 h-5 text-primary" />
                <span>{formatDistanceToNow(new Date(request.createdAt))} ago</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="w-5 h-5 text-primary" />
                <span>{format(new Date(request.createdAt), "MMM d, yyyy")}</span>
              </div>
            </div>
            
            {(request.location || request.contactPhone) && (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 space-y-3">
                <h4 className="font-semibold text-amber-900 text-sm uppercase tracking-wider">Private Details</h4>
                {request.location && (
                  <div>
                    <span className="text-xs text-amber-700/70 block">Full Address</span>
                    <span className="text-amber-900 font-medium">{request.location}</span>
                  </div>
                )}
                {request.contactPhone && (
                  <div>
                    <span className="text-xs text-amber-700/70 block">Contact Phone</span>
                    <span className="text-amber-900 font-medium">{request.contactPhone}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Applications ({request.applications.length})</h2>
        
        {request.applications.length === 0 ? (
          <div className="text-center p-12 border border-dashed rounded-xl bg-muted/20">
            <Clock className="w-10 h-10 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">Waiting for volunteers</h3>
            <p className="text-muted-foreground">No one has applied to this request yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {request.applications.map((app) => (
                <motion.div 
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className={`overflow-hidden transition-all ${app.status === 'approved' ? 'border-emerald-500 ring-1 ring-emerald-500/20 shadow-md shadow-emerald-500/5' : app.status === 'rejected' ? 'opacity-60 bg-muted/50' : ''}`}>
                    <div className="flex flex-col md:flex-row">
                      <div className="p-6 flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-semibold flex items-center gap-2">
                              {app.volunteer.name}
                              {app.status === 'approved' && (
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                </motion.span>
                              )}
                            </h3>
                            <p className="text-muted-foreground">{app.volunteer.roleTitle} • {app.volunteer.cityArea}</p>
                          </div>
                          {app.status === 'approved' ? (
                            <Badge className="bg-emerald-500 hover:bg-emerald-600">Approved</Badge>
                          ) : app.status === 'rejected' ? (
                            <Badge variant="secondary">Rejected</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                            <Star className="w-4 h-4 text-amber-500" /> {app.volunteer.rating.toFixed(1)} Rating
                          </div>
                          <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                            <Award className="w-4 h-4 text-primary" /> {app.volunteer.completedHelps} Completed
                          </div>
                          <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                            <Clock className="w-4 h-4" /> {app.volunteer.experienceYears}y Experience
                          </div>
                        </div>

                        {app.volunteer.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {app.volunteer.skills.map(skill => (
                              <Badge key={skill} variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10 font-normal">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="bg-muted/50 p-4 rounded-lg relative">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 rounded-l-lg"></div>
                          <p className="italic text-muted-foreground">"{app.message}"</p>
                        </div>
                      </div>

                      <div className="bg-muted/30 p-6 md:w-64 border-t md:border-t-0 md:border-l flex flex-col justify-center gap-3">
                        {app.status === 'pending' ? (
                          <>
                            <p className="text-sm text-center text-muted-foreground mb-2">Decide on this application</p>
                     <Button data-testid={`button-approve-application-${app.id}`}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleDecision(app.id, "approved")}
                              disabled={decideApplication.isPending}
                            >
                              {decideApplication.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                              Approve
                            </Button>
                     <Button data-testid={`button-reject-application-${app.id}`}
                              variant="outline" 
                              className="w-full text-rose-600 hover:bg-rose-50"
                              onClick={() => handleDecision(app.id, "rejected")}
                              disabled={decideApplication.isPending}
                            >
                              Reject
                            </Button>
                          </>
                        ) : app.status === 'approved' ? (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                          >
                            <div className="text-center">
                              <p className="text-sm font-medium text-emerald-600 mb-1">Volunteer Contact</p>
                              <div className="flex items-center justify-between p-2 bg-white rounded border shadow-sm">
                                <span className="font-mono text-sm">{app.volunteer.phone}</span>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(app.volunteer.phone)}>
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <Button className="w-full" asChild>
                              <a href={`tel:${app.volunteer.phone}`}>
                                <Phone className="w-4 h-4 mr-2" /> Call Volunteer
                              </a>
                            </Button>
                          </motion.div>
                        ) : (
                          <div className="text-center text-muted-foreground">
                            <XCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">Application rejected</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
