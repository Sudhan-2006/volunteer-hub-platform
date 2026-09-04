import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useLocation } from "wouter";
import { useLogin, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import authBrandImg from "@/assets/auth-brand.png";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const login = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    login.mutate({ data }, {
      onSuccess: (user) => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast.success("Welcome back!");
        setLocation(`/dashboard/${user.role}`);
      },
      onError: (error) => {
        toast.error("Login failed. Please check your credentials.");
      }
    });
  };

  return (
    <div className="grid min-h-[100dvh] bg-background lg:grid-cols-[.9fr_1.1fr]">
      <div className="relative hidden overflow-hidden bg-[#1E1E1E] lg:block">
        <img 
          src={authBrandImg} 
          alt="Brand" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1E1E1E]/55 flex items-end p-12">
          <div className="max-w-lg text-white">
            <span className="label-mono text-[#A9C7FF]">Volunteer Hub</span><h1 className="mb-4 mt-3 text-4xl font-bold tracking-tight">Good work starts with showing up.</h1>
            <p className="text-lg text-white/75">Continue your journey of making a difference, one neighbor at a time.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-10 sm:p-10">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Link href="/" data-testid="link-back-home" className="mb-10 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>
            <span className="label-mono text-primary">welcome back</span><h2 className="mt-3 text-3xl font-bold tracking-tight">Sign in to Volunteer Hub</h2>
            <p className="text-muted-foreground mt-2">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Create one
              </Link>
            </p>
          </div>

          <Card className="surface-shadow mt-8 border-border/80 p-6 sm:p-8"><form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                  <Input data-testid="input-email" aria-invalid={!!errors.email}
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                  <Input data-testid="input-password" aria-invalid={!!errors.password}
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

            <Button data-testid="button-submit-login" type="submit" className="h-12 w-full text-base" disabled={login.isPending}>
              {login.isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : null}
              Sign In
            </Button>
          </form></Card>

          <Card className="mt-4 border-dashed bg-muted/40 p-4">
            <p className="text-sm text-center text-muted-foreground">
              <span className="font-semibold">Admin demo:</span> admin@volunteerai.app / admin123
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
