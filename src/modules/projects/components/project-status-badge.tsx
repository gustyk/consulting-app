import { Badge } from "@/components/ui/badge";

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  closed: "default",
  cancelled: "destructive",
  preparation: "secondary",
};

export function ProjectStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={STATUS_VARIANTS[status] ?? "outline"}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
