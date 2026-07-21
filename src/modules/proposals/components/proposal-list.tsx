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

type ProposalRow = {
  id: string;
  number: string;
  status: string;
  client: { name: string; code: string };
  total: number;
  createdAt: string;
  approver?: { fullName: string | null };
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  waiting_approval: "outline",
  approved: "default",
  sent: "default",
  accepted: "default",
  rejected: "destructive",
  expired: "secondary",
};

export function ProposalList({ proposals }: { proposals: ProposalRow[] }) {
  const router = useRouter();

  function formatCurrency(cents: number) {
    return `Rp${(cents / 100).toLocaleString("id-ID")}`;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Number</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {proposals.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-mono text-xs">
              <Link href={`/proposals/${p.id}`} className="hover:underline">
                {p.number}
              </Link>
            </TableCell>
            <TableCell>{p.client.name} ({p.client.code})</TableCell>
            <TableCell className="text-right font-mono">{formatCurrency(p.total)}</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANTS[p.status] ?? "secondary"}>
                {p.status.replace("_", " ")}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {format(new Date(p.createdAt), "dd MMM yyyy")}
            </TableCell>
            <TableCell className="space-x-1">
              <Button variant="outline" size="sm" onClick={() => router.push(`/proposals/${p.id}`)}>
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {proposals.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              No proposals yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}