import { useAdminListVolunteers, getAdminListVolunteersQueryKey } from "@workspace/api-client-react";
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
import { Badge } from "@/components/ui/badge";

export default function AdminVolunteers() {
  const [, setLocation] = useLocation();
  const { data: volunteers, isLoading } = useAdminListVolunteers({
    query: { queryKey: getAdminListVolunteersQueryKey() }
  });

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Volunteers</h1>
        <p className="text-muted-foreground mt-1">Manage platform volunteers and their applications.</p>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role / City</TableHead>
              <TableHead className="text-center">Total Apps</TableHead>
              <TableHead className="text-center">Approved</TableHead>
              <TableHead className="text-center">Pending</TableHead>
              <TableHead className="text-center">Rejected</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {volunteers?.map((vol, i) => (
              <motion.tr
                key={vol.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="cursor-pointer hover:bg-muted/50 transition-colors border-b"
                onClick={() => setLocation(`/dashboard/admin/volunteers/${vol.userId}`)}
              >
                <TableCell>
                  <p className="font-medium">{vol.name}</p>
                  <p className="text-xs text-muted-foreground">{vol.email}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 mb-1">{vol.roleTitle}</Badge>
                  <p className="text-xs text-muted-foreground">{vol.cityArea}</p>
                </TableCell>
                <TableCell className="text-center font-bold">{vol.totalApplications}</TableCell>
                <TableCell className="text-center text-emerald-600 font-medium">{vol.approved}</TableCell>
                <TableCell className="text-center text-amber-600 font-medium">{vol.pending}</TableCell>
                <TableCell className="text-center text-rose-600 font-medium">{vol.rejected}</TableCell>
              </motion.tr>
            ))}
            {volunteers?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No volunteers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
