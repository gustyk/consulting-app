"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAD_STATUSES } from "../types";
import { updateLeadStatus, deleteLead } from "../actions";

type LeadRow = {
  id: string;
  code: string;
  name: string;
  company: string | null;
  email: string | null;
  status: string;
  source: string | null;
  estimatedValue: number | null;
  assigned: { fullName: string | null } | null;
};

export function LeadList({ leads }: { leads: LeadRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function onStatus(id: string, status: string) {
    setBusy(id);
    try {
      await updateLeadStatus({ id, status: status as (typeof LEAD_STATUSES)[number] });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function onDelete(id: string) {
    setBusy(id);
    try {
      await deleteLead(id);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Est. Value</TableHead>
          <TableHead>Assigned</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((l) => (
          <TableRow key={l.id}>
            <TableCell className="font-mono text-xs">{l.code}</TableCell>
            <TableCell>{l.name}</TableCell>
            <TableCell>{l.company ?? "—"}</TableCell>
            <TableCell>
              <Select
                value={l.status}
                onValueChange={(v) => v && onStatus(l.id ?? "", v)}
                disabled={busy === l.id}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>{l.source ?? "—"}</TableCell>
            <TableCell>
              {l.estimatedValue
                ? `Rp${(l.estimatedValue / 1_000_000).toFixed(1)}M`
                : "—"}
            </TableCell>
            <TableCell>{l.assigned?.fullName ?? "—"}</TableCell>
            <TableCell className="space-x-1">
              <Button
                variant="outline"
                size="sm"
                disabled={busy === l.id}
                onClick={() => onDelete(l.id ?? "")}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {leads.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground">
              No leads yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
