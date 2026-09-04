import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateRequest, getGetUserDashboardQueryKey, getListRequestsQueryKey, Urgency } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";

const createRequestSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  purpose: z.string().min(10, "Purpose must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  urgency: z.enum(["low", "medium", "high"] as const),
  cityArea: z.string().min(2, "City area is required"),
  location: z.string().min(5, "Full location is required"),
  contactPhone: z.string().min(5, "Contact phone is required"),
});

type CreateRequestFormValues = z.infer<typeof createRequestSchema>;

const CATEGORIES = [
  "Medical", "Education", "Disaster Relief", "Elder Care", "Transport", "Tech Support", "Other"
];

export default function NewRequest() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createRequest = useCreateRequest();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateRequestFormValues>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      urgency: "medium"
    }
  });

  const onSubmit = (data: CreateRequestFormValues) => {
    createRequest.mutate({ data }, {
      onSuccess: () => {
        toast.success("Request created successfully!");
        queryClient.invalidateQueries({ queryKey: getGetUserDashboardQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListRequestsQueryKey() });
        setLocation("/dashboard/user");
      },
      onError: () => {
        toast.error("Failed to create request");
      }
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-10">
      <Link href="/dashboard/user" className="mb-8 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>
      
      <div className="mb-8">
        <span className="label-mono text-[#9A6800]">ask your neighborhood</span><h1 className="mt-2 text-3xl font-bold tracking-tight">Post a request</h1>
        <p className="text-muted-foreground mt-2">Describe what you need help with to connect with local volunteers.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="surface-shadow space-y-6 rounded-2xl border border-border/80 bg-card p-6 sm:p-8">
          <div className="space-y-2">
            <Label htmlFor="title">Short Title</Label>
            <Input id="title" placeholder="e.g. Need help with groceries delivery" {...register("title")} className={errors.title ? "border-destructive" : ""} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(val) => setValue("category", val)}>
                <SelectTrigger id="category" className={errors.category ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Urgency</Label>
              <RadioGroup 
                defaultValue="medium" 
                onValueChange={(val) => setValue("urgency", val as Urgency)}
                className="flex gap-4 pt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="u-low" />
                  <Label htmlFor="u-low" className="text-emerald-600">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="u-med" />
                  <Label htmlFor="u-med" className="text-amber-600">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="u-high" />
                  <Label htmlFor="u-high" className="text-rose-600">High</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose (One sentence summary)</Label>
            <Input id="purpose" placeholder="Why do you need this help?" {...register("purpose")} className={errors.purpose ? "border-destructive" : ""} />
            {errors.purpose && <p className="text-sm text-destructive">{errors.purpose.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description</Label>
            <Textarea 
              id="description" 
              placeholder="Provide all the details a volunteer would need to know..." 
              className={`min-h-[120px] resize-y ${errors.description ? "border-destructive" : ""}`}
              {...register("description")} 
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>
        </div>

        <div className="surface-shadow space-y-6 rounded-2xl border border-border/80 bg-card p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">Location & Contact</h3>
          </div>
          
          <Card className="mb-6 border-[#F9AB00]/25 bg-[#F9AB00]/[.08] shadow-none">
            <CardContent className="p-4 flex gap-3 text-amber-800">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">
                <strong>Privacy Notice:</strong> City Area is public. Full Location and Contact Phone are private and will ONLY be revealed to the specific volunteers you explicitly approve.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="cityArea">City Area (Public)</Label>
            <Input id="cityArea" placeholder="e.g. Downtown North, Westside" {...register("cityArea")} className={errors.cityArea ? "border-destructive" : ""} />
            {errors.cityArea && <p className="text-sm text-destructive">{errors.cityArea.message}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="location">Full Location / Address (Private)</Label>
              <Input id="location" placeholder="123 Main St, Apt 4B" {...register("location")} className={errors.location ? "border-destructive" : ""} />
              {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone (Private)</Label>
              <Input id="contactPhone" placeholder="(555) 123-4567" {...register("contactPhone")} className={errors.contactPhone ? "border-destructive" : ""} />
              {errors.contactPhone && <p className="text-sm text-destructive">{errors.contactPhone.message}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/dashboard/user">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" className="min-w-[150px] bg-[#F9AB00] text-[#1E1E1E] hover:bg-[#F9AB00]/90" disabled={createRequest.isPending}>
            {createRequest.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Post Request
          </Button>
        </div>
      </form>
    </div>
  );
}
