"use client";

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
import { deleteClient } from "../actions";

type ClientRow = {
  id: string;
  code: string;
  name: string;
  npwp: string | null;
  status: string;
  pic: unknown;
};

export function ClientList({ clients }: { clients: ClientRow[] }) {
  const router = useRouter();

  async function onDelete(id: string) {
    if (!confirm("Delete this client?")) return;
    await deleteClient(id);
    router.refresh();
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>NPWP</TableHead>
          <TableHead>PIC Count</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((c) => {
          const pics = Array.isArray(c.pic) ? c.pic : [];
          return (
            <TableRow key={c.id}>
              <TableCell className="font-mono text-xs">{c.code}</TableCell>
              <TableCell>
                <button
                  className="text-left hover:underline"
                  onClick={() => router.push(`/clients/${c.id}`)}
                >
                  {c.name}
                </button>
              </TableCell>
              <TableCell>{c.npwp ?? "—"}</TableCell>
              <TableCell>{pics.length}</TableCell>
              <TableCell>
                <Badge variant={c.status === "active" ? "default" : "secondary"}>
                  {c.status}
                </Badge>
              </TableCell>
              <TableCell className="space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/clients/${c.id}`)}
                >
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(c.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
        {clients.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              No clients yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
