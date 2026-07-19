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
import { ROLES } from "../types";
import { assignUserRole, deactivateUser } from "../actions";

type UserRow = {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  isActive: boolean;
  userRoles: { role: { name: string } }[];
};

export function UserList({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function onAssign(id: string, role: string) {
    setBusy(id);
    try {
      await assignUserRole({ userId: id, role: role as (typeof ROLES)[number] });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function onDeactivate(id: string) {
    setBusy(id);
    try {
      await deactivateUser(id);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u) => (
          <TableRow key={u.id}>
            <TableCell>{u.fullName ?? "—"}</TableCell>
            <TableCell>{u.email}</TableCell>
            <TableCell>
              <Select
                value={u.role ?? "officer"}
                onValueChange={(v) => onAssign(u.id ?? "", v ?? "officer")}
                disabled={busy === u.id}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Badge variant={u.isActive ? "default" : "secondary"}>
                {u.isActive ? "active" : "inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                disabled={!u.isActive || busy === u.id}
                onClick={() => onDeactivate(u.id ?? "")}
              >
                Deactivate
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
