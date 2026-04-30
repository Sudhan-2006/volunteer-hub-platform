import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster as SonnerToaster } from "sonner";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient"; // Assume this exists or we create it
import { AuthProvider, ProtectedRoute } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// User Pages
import UserDashboard from "@/pages/UserDashboard";
import NewRequest from "@/pages/NewRequest";
import UserRequestDetail from "@/pages/UserRequestDetail";

// Volunteer Pages
import VolunteerDashboard from "@/pages/VolunteerDashboard";
import VolunteerProfile from "@/pages/VolunteerProfile";
import VolunteerRequestDetail from "@/pages/VolunteerRequestDetail";

// Admin Pages
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUsers from "@/pages/AdminUsers";
import AdminVolunteers from "@/pages/AdminVolunteers";
import AdminUserDetail from "@/pages/AdminUserDetail";
import AdminVolunteerDetail from "@/pages/AdminVolunteerDetail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      <Route path="/dashboard/user">
        <ProtectedRoute allowedRoles={['user']}>
          <AppLayout>
            <UserDashboard />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard/user/new">
        <ProtectedRoute allowedRoles={['user']}>
          <AppLayout>
            <NewRequest />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard/user/requests/:id">
        {(params) => (
          <ProtectedRoute allowedRoles={['user']}>
            <AppLayout>
              <UserRequestDetail id={parseInt(params.id)} />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/dashboard/volunteer">
        <ProtectedRoute allowedRoles={['volunteer']}>
          <AppLayout>
            <VolunteerDashboard />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard/volunteer/profile">
        <ProtectedRoute allowedRoles={['volunteer']}>
          <AppLayout>
            <VolunteerProfile />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard/volunteer/requests/:id">
        {(params) => (
          <ProtectedRoute allowedRoles={['volunteer']}>
            <AppLayout>
              <VolunteerRequestDetail id={parseInt(params.id)} />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/dashboard/admin">
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout>
            <AdminDashboard />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard/admin/users">
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout>
            <AdminUsers />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard/admin/volunteers">
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout>
            <AdminVolunteers />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard/admin/users/:id">
        {(params) => (
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout>
              <AdminUserDetail id={parseInt(params.id)} />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/dashboard/admin/volunteers/:id">
        {(params) => (
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout>
              <AdminVolunteerDetail id={parseInt(params.id)} />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <SonnerToaster />
          <ShadcnToaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
