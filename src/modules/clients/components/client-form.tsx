"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createClientSchema,
  CLIENT_STATUSES,
  type CreateClientInput,
  type Pic,
} from "../types";
import { createClient, updateClient } from "../actions";

type Props = {
  clientId?: string;
  defaultValues?: Partial<CreateClientInput>;
};

export function ClientForm({ clientId, defaultValues }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pics, setPics] = useState<Pic[]>(defaultValues?.pic ?? []);

  const form = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema),
    defaultValues: { status: "active", ...defaultValues },
  });

  async function onSubmit(values: CreateClientInput) {
    setLoading(true);
    setError(null);
    try {
      const payload = { ...values, pic: pics };
      if (clientId) {
        await updateClient(clientId, payload);
      } else {
        await createClient(payload);
      }
      router.refresh();
      if (!clientId) form.reset();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="npwp">NPWP</Label>
          <Input id="npwp" {...form.register("npwp")} />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            defaultValue={form.getValues("status") ?? "active"}
            onValueChange={(v) =>
              form.setValue("status", v as CreateClientInput["status"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CLIENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" {...form.register("address")} />
      </div>

      <div className="space-y-2">
        <Label>PIC(s)</Label>
        {pics.map((p, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 items-end">
            <Input
              placeholder="Name"
              value={p.name}
              onChange={(e) =>
                setPics((prev) =>
                  prev.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)),
                )
              }
            />
            <Input
              placeholder="Role"
              value={p.role ?? ""}
              onChange={(e) =>
                setPics((prev) =>
                  prev.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)),
                )
              }
            />
            <Input
              placeholder="Email"
              value={p.email ?? ""}
              onChange={(e) =>
                setPics((prev) =>
                  prev.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)),
                )
              }
            />
            <div className="flex gap-1">
              <Input
                placeholder="Phone"
                value={p.phone ?? ""}
                onChange={(e) =>
                  setPics((prev) =>
                    prev.map((x, j) =>
                      j === i ? { ...x, phone: e.target.value } : x,
                    ),
                  )
                }
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPics((prev) => prev.filter((_, j) => j !== i))}
              >
                ✕
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPics((prev) => [...prev, { name: "" }])}
        >
          + Add PIC
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : clientId ? "Update Client" : "Create Client"}
      </Button>
    </form>
  );
}
