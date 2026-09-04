import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, User, LayoutDashboard, Menu, X, HeartHandshake, Users, BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const logout = useLogout();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/");
      },
    });
  };

  const roleColors = {
    user: "bg-[#F9AB00]/10 text-[#9A6800] border-[#F9AB00]/25",
    volunteer: "bg-[#34A853]/10 text-[#21833E] border-[#34A853]/25",
    admin: "bg-[#4285F4]/10 text-[#2563C4] border-[#4285F4]/25",
  };
  const navItems = user?.role === "admin"
    ? [{ href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard }, { href: "/dashboard/admin/users", label: "Users", icon: Users }, { href: "/dashboard/admin/volunteers", label: "Volunteers", icon: BriefcaseBusiness }]
    : user?.role === "volunteer"
      ? [{ href: "/dashboard/volunteer", label: "Find ways to help", icon: LayoutDashboard }, { href: "/dashboard/volunteer/profile", label: "My profile", icon: User }]
      : [{ href: "/dashboard/user", label: "My dashboard", icon: LayoutDashboard }, { href: "/dashboard/user/new", label: "Post a request", icon: HeartHandshake }];

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-[1440px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button aria-label="Open navigation" data-testid="button-open-navigation" className="rounded-lg p-2 hover:bg-muted lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href={user ? `/dashboard/${user.role}` : "/"} className="flex items-center gap-3" data-testid="link-brand">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#4285F4] text-sm font-bold text-white shadow-sm">
                <span className="absolute left-0 top-0 h-2 w-2 rounded-tl-xl bg-[#EA4335]" /><span className="absolute bottom-0 right-0 h-2 w-2 rounded-br-xl bg-[#34A853]" />
                V
              </div>
              <div><span className="block text-[15px] font-bold leading-none tracking-tight">Volunteer Hub</span><span className="label-mono mt-1 hidden text-muted-foreground sm:block">community network</span></div>
            </Link>
            {user && <span className={cn("hidden rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize sm:inline-flex", roleColors[user.role])}>{user.role}</span>}
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-muted-foreground md:block">Good to see you, <strong className="text-foreground">{user.name.split(" ")[0]}</strong></span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" data-testid="button-user-menu" className="relative h-10 w-10 rounded-xl p-0">
                    <Avatar className="h-9 w-9 rounded-xl">
                      <AvatarFallback className="rounded-xl bg-[#4285F4]/12 font-semibold text-[#2563C4]">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation(`/dashboard/${user.role}`)}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                  </DropdownMenuItem>
                  {user.role === "volunteer" && (
                    <DropdownMenuItem onClick={() => setLocation("/dashboard/volunteer/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        {user && <nav className="mx-auto hidden max-w-[1440px] items-center gap-1 px-6 pb-3 lg:flex">
          {navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} data-testid={`link-nav-${label.toLowerCase().replaceAll(" ", "-")}`} className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors", location === href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}><Icon className="h-4 w-4" />{label}</Link>)}
        </nav>}
        {user && mobileOpen && <nav className="border-t bg-background px-4 py-3 lg:hidden">
          {navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} data-testid={`link-mobile-nav-${label.toLowerCase().replaceAll(" ", "-")}`} className={cn("flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium", location === href ? "bg-primary/10 text-primary" : "text-muted-foreground")}><Icon className="h-4 w-4" />{label}</Link>)}
        </nav>}
      </header>

      <main className="relative flex-1 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
