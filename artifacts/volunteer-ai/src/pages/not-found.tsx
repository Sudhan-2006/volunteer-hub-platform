import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="page-grid flex min-h-[100dvh] w-full items-center justify-center">
      <Card className="surface-shadow mx-4 w-full max-w-md border-border/80">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-[#EA4335]" />
            <h1 className="text-2xl font-bold">Page not found</h1>
          </div>

            <p className="mt-4 text-sm text-muted-foreground">
             This page is not part of the Volunteer Hub neighborhood.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
