import { useState, KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useGetMyVolunteerProfile, 
  getGetMyVolunteerProfileQueryKey,
  useUpdateVolunteerProfile,
  getGetVolunteerDashboardQueryKey,
  getGetMeQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { toast } from "sonner";
import { Loader2, ArrowLeft, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const profileSchema = z.object({
  roleTitle: z.string().min(2, "Role title is required"),
  bio: z.string().min(10, "Bio should be at least 10 characters"),
  phone: z.string().min(5, "Phone is required"),
  cityArea: z.string().min(2, "City area is required"),
  availability: z.string().min(2, "Availability is required"),
  experienceYears: z.coerce.number().min(0, "Experience cannot be negative"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ROLE_TITLES = [
  "Medical Helper", "Tutor", "Elder Care", "Disaster Response", "Tech Support", "Transport", "Other"
];

export default function VolunteerProfile() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const { data: profile, isLoading } = useGetMyVolunteerProfile({
    query: {
      queryKey: getGetMyVolunteerProfileQueryKey(),
    }
  });

  const updateProfile = useUpdateVolunteerProfile();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: profile ? {
      roleTitle: profile.roleTitle,
      bio: profile.bio || "",
      phone: profile.phone || "",
      cityArea: profile.cityArea || "",
      availability: profile.availability || "",
      experienceYears: profile.experienceYears || 0,
    } : undefined
  });

  // Initialize skills
  if (profile && skills.length === 0 && profile.skills.length > 0) {
    setSkills(profile.skills);
  }

  const handleAddSkill = (e?: KeyboardEvent<HTMLInputElement>) => {
    if (e && e.key !== "Enter") return;
    if (e) e.preventDefault();
    
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile.mutate({ 
      data: { 
        ...data,
        skills
      } 
    }, {
      onSuccess: () => {
        toast.success("Profile saved successfully!");
        queryClient.invalidateQueries({ queryKey: getGetMyVolunteerProfileQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetVolunteerDashboardQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/dashboard/volunteer");
      },
      onError: () => {
        toast.error("Failed to save profile");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[50vh] items-center justify-center p-8">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-[#34A853]/15" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-10">
      <Link href="/dashboard/volunteer" className="mb-8 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Volunteer Profile</h1>
        <p className="text-muted-foreground mt-2">Tell us about your skills and experience to help users trust you.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="surface-shadow space-y-8 rounded-2xl border border-border/80 bg-card p-6 sm:p-8">
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="roleTitle">Primary Role</Label>
            <Select onValueChange={(val) => setValue("roleTitle", val)} defaultValue={profile?.roleTitle}>
              <SelectTrigger id="roleTitle" className={errors.roleTitle ? "border-destructive" : ""}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_TITLES.map(title => (
                  <SelectItem key={title} value={title}>{title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roleTitle && <p className="text-sm text-destructive">{errors.roleTitle.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="experienceYears">Years of Experience</Label>
            <Input id="experienceYears" type="number" min="0" {...register("experienceYears")} className={errors.experienceYears ? "border-destructive" : ""} />
            {errors.experienceYears && <p className="text-sm text-destructive">{errors.experienceYears.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Skills</Label>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map(skill => (
              <Badge key={skill} variant="secondary" className="px-3 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 flex items-center gap-1">
                {skill}
                <button type="button" onClick={() => removeSkill(skill)} className="text-teal-700 hover:text-teal-900 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input 
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              placeholder="Add a skill and press Enter"
            />
            <Button type="button" variant="outline" onClick={() => handleAddSkill()} className="shrink-0">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea 
            id="bio" 
            placeholder="Tell us a bit about yourself and why you want to help..." 
            className={`min-h-[120px] resize-y ${errors.bio ? "border-destructive" : ""}`}
            {...register("bio")} 
          />
          {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phone">Contact Phone</Label>
            <Input id="phone" placeholder="(555) 123-4567" {...register("phone")} className={errors.phone ? "border-destructive" : ""} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cityArea">City Area</Label>
            <Input id="cityArea" placeholder="e.g. Downtown North" {...register("cityArea")} className={errors.cityArea ? "border-destructive" : ""} />
            {errors.cityArea && <p className="text-sm text-destructive">{errors.cityArea.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">Availability</Label>
            <Input id="availability" placeholder="e.g. Weekends, Evenings" {...register("availability")} className={errors.availability ? "border-destructive" : ""} />
            {errors.availability && <p className="text-sm text-destructive">{errors.availability.message}</p>}
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end gap-4">
          <Link href="/dashboard/volunteer">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
           <Button type="submit" className="min-w-[150px] bg-[#34A853] text-white hover:bg-[#21833E]" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
