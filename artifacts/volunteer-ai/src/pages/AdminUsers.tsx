import { useAdminListUsers, getAdminListUsersQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export default function AdminUsers() {
  const [, setLocation] = useLocation();
  const { data: users, isLoading } = useAdminListUsers({
    query: { queryKey: getAdminListUsersQueryKey() }
  });

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[50vh] items-center justify-center p-8">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-primary/15" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="mb-8">
        <span className="label-mono text-primary">directory / people asking</span><h1 className="mt-2 text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground mt-1">Manage users who post requests.</p>
      </div>

      <div className="surface-shadow overflow-x-auto rounded-2xl border border-border/80 bg-card"><Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Total Requests</TableHead>
              <TableHead className="text-center">Open</TableHead>
              <TableHead className="text-center">Completed</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user, i) => (
              <motion.tr data-testid={`row-user-${user.id}`}
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="cursor-pointer hover:bg-muted/50 transition-colors border-b"
                onClick={() => setLocation(`/dashboard/admin/users/${user.id}`)}
              >
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="text-center font-bold">{user.totalRequests}</TableCell>
                <TableCell className="text-center text-blue-600">{user.openRequests}</TableCell>
                <TableCell className="text-center text-emerald-600">{user.completedRequests}</TableCell>
                <TableCell className="text-muted-foreground">{format(new Date(user.createdAt), "MMM d, yyyy")}</TableCell>
              </motion.tr>
            ))}
            {users?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
