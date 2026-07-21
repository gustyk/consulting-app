"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

type ProjectRow = {
  id: string;
  code: string;
  client: { name: string; code: string };
  status: string;
  value: number;
  startDate: string | null;
  endDate: string | null;
  _count: { milestones: number; deliverables: number; partners: number };
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  closed: "default",
  cancelled: "destructive",
  preparation: "secondary",
};

export function ProjectList({ projects }: { projects: ProjectRow[] }) {
  const router = useRouter();

  function formatCurrency(cents: number) {
    return `Rp${(cents / 100).toLocaleString("id-ID")}`;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Value</TableHead>
          <TableHead className="text-center">Milestones</TableHead>
          <TableHead>Start</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-mono text-xs">
              <Link href={`/projects/${p.id}`} className="hover:underline">
                {p.code}
              </Link>
            </TableCell>
            <TableCell>{p.client.name}</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANTS[p.status] ?? "outline"}>
                {p.status.replace(/_/g, " ")}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-mono">{formatCurrency(p.value)}</TableCell>
            <TableCell className="text-center">{p._count.milestones}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {p.startDate ? format(new Date(p.startDate), "dd MMM") : "—"}
            </TableCell>
            <TableCell className="space-x-1">
              <Button variant="outline" size="sm" onClick={() => router.push(`/projects/${p.id}`)}>
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {projects.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground">
              No projects yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
