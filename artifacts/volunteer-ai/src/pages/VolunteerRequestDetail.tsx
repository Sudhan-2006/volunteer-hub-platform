import { useState } from "react";
import { useGetRequest, getGetRequestQueryKey, useApplyToRequest, getGetVolunteerDashboardQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, ArrowLeft, MapPin, Clock, Calendar, Phone, CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";

export default function VolunteerRequestDetail({ id }: { id: number }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  
  const { data: request, isLoading } = useGetRequest(id, {
    query: { queryKey: getGetRequestQueryKey(id), enabled: !!id }
  });

  const applyToRequest = useApplyToRequest();

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[50vh] items-center justify-center p-8">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-[#34A853]/15" />
      </div>
    );
  }

  if (!request || !user) return <div className="p-8">Request not found</div>;

  const myApplication = request.applications.find(app => app.volunteer.userId === user.id);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    applyToRequest.mutate({ data: { requestId: id, message } }, {
      onSuccess: () => {
        toast.success("Application submitted successfully!");
        queryClient.invalidateQueries({ queryKey: getGetRequestQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getGetVolunteerDashboardQueryKey() });
      },
      onError: () => {
        toast.error("Failed to submit application");
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-9 px-4 py-8 sm:px-6 lg:py-10">
      <Link href="/dashboard/volunteer" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="surface-shadow overflow-hidden rounded-2xl border border-border/80 bg-card">
        <div className="border-b border-border/70 bg-[#34A853]/[.045] p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant="secondary">{request.category}</Badge>
            <Badge variant="outline" className={
              request.urgency === 'high' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
              request.urgency === 'medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
              'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
            }>
              {request.urgency} urgency
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">{request.title}</h1>
          <p className="text-xl text-muted-foreground">Posted by {request.userName}</p>
        </div>

        <div className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h3 className="text-lg font-semibold mb-2">Purpose</h3>
              <p className="text-muted-foreground text-lg">{request.purpose}</p>
            </section>
            
            <section>
              <h3 className="text-lg font-semibold mb-2">Detailed Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{request.description}</p>
            </section>
            
            {myApplication?.status === 'approved' && (request.location || request.contactPhone) && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-[#34A853]/25 bg-[#34A853]/[.08] p-6"
              >
                <div className="flex items-center gap-2 mb-4 text-teal-800">
                  <CheckCircle2 className="w-6 h-6" />
                  <h3 className="text-xl font-semibold">You have been approved!</h3>
                </div>
                <p className="text-teal-700 mb-6">The user has approved your application and shared their private details with you.</p>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {request.location && (
                    <Card className="border-teal-200 shadow-none">
                      <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground mb-1 block">Full Address</span>
                          <span className="text-lg font-medium">{request.location}</span>
                        </div>
                        <Button variant="outline" className="w-full mt-4" onClick={() => copyToClipboard(request.location!)}>
                          <MapPin className="w-4 h-4 mr-2" /> Copy Address
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                  {request.contactPhone && (
                    <Card className="border-teal-200 shadow-none">
                      <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground mb-1 block">Contact Phone</span>
                          <span className="text-lg font-mono font-medium">{request.contactPhone}</span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" className="flex-1" onClick={() => copyToClipboard(request.contactPhone!)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button className="flex-[3] bg-teal-600 hover:bg-teal-700" asChild>
                            <a href={`tel:${request.contactPhone}`}>
                              <Phone className="w-4 h-4 mr-2" /> Call
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </motion.section>
            )}
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

            <div className="pt-6 border-t">
              {!myApplication ? (
                <form onSubmit={handleApply} className="space-y-4">
                  <h3 className="font-semibold text-lg">Apply to help</h3>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message to the user</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Hi! I can help with this because..." 
                      className="resize-y"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      required
                    />
                  </div>
                   <Button data-testid="button-submit-application" type="submit" className="w-full bg-[#34A853] text-white hover:bg-[#21833E]" disabled={applyToRequest.isPending}>
                    {applyToRequest.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Submit Application
                  </Button>
                </form>
              ) : myApplication.status === 'pending' ? (
                <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">Application submitted</p>
                  <p className="text-sm mt-1 opacity-80">Awaiting user approval</p>
                </div>
              ) : myApplication.status === 'rejected' ? (
                <div className="bg-muted p-4 rounded-xl border text-center">
                  <p className="text-muted-foreground font-medium">Application not accepted</p>
                  <p className="text-sm mt-1 text-muted-foreground/70">The user chose someone else for this request.</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
