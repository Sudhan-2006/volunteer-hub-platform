import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useRegister, getGetMeQueryKey, RegisterBodyRole } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Heart, HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  role: z.enum([RegisterBodyRole.user, RegisterBodyRole.volunteer]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const registerMutation = useRegister();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: RegisterBodyRole.user
    }
  });

  const selectedRole = watch("role");

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate({ data }, {
      onSuccess: (user) => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast.success("Account created successfully!");
        setLocation(`/dashboard/${user.role}`);
      },
      onError: (error) => {
        toast.error("Registration failed. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-8 bg-background p-8 rounded-3xl shadow-xl border">
        <div>
          <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
          <p className="text-muted-foreground mt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <Label>I want to...</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setValue("role", RegisterBodyRole.user)}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                  selectedRole === RegisterBodyRole.user 
                    ? "border-amber-500 bg-amber-500/10 text-amber-700" 
                    : "border-border hover:border-muted-foreground/30 text-muted-foreground"
                )}
              >
                <Heart className="w-8 h-8 mb-2" />
                <span className="font-semibold">Get Help</span>
              </button>
              
              <button
                type="button"
                onClick={() => setValue("role", RegisterBodyRole.volunteer)}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                  selectedRole === RegisterBodyRole.volunteer 
                    ? "border-teal-500 bg-teal-500/10 text-teal-700" 
                    : "border-border hover:border-muted-foreground/30 text-muted-foreground"
                )}
              >
                <HandHeart className="w-8 h-8 mb-2" />
                <span className="font-semibold">Volunteer</span>
              </button>
            </div>
            {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                {...register("name")}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-lg" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : null}
            Create Account
          </Button>
        </form>
      </div>
    </div>
  );
}
