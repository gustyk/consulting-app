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
  createLeadSchema,
  LEAD_STATUSES,
  LEAD_SOURCES,
  type CreateLeadInput,
} from "../types";
import { createLead, updateLead } from "../actions";

type Props = {
  leadId?: string;
  defaultValues?: Partial<CreateLeadInput>;
};

export function LeadForm({ leadId, defaultValues }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const initialStatus = useState(
    () => (defaultValues?.status ?? "new") as CreateLeadInput["status"]
  )[0];
  const initialSource = useState(
    () => (defaultValues?.source ?? "")
  )[0];

  const form = useForm<CreateLeadInput>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: { status: "new", estimatedValue: undefined, ...defaultValues },
  });

  async function onSubmit(values: CreateLeadInput) {
    setLoading(true);
    setError(null);
    try {
      if (leadId) {
        await updateLead(leadId, values);
      } else {
        await createLead(values);
      }
      router.refresh();
      if (!leadId) form.reset();
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
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register("email")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...form.register("phone")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" {...form.register("company")} />
        </div>
        <div className="space-y-2">
          <Label>Source</Label>
          <Select
            defaultValue={initialSource}
            onValueChange={(v) => form.setValue("source", (v || undefined) as CreateLeadInput["source"])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {LEAD_SOURCES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="serviceInterest">Service Interest</Label>
          <Input id="serviceInterest" {...form.register("serviceInterest")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedValue">Est. Value (IDR)</Label>
          <Input
            id="estimatedValue"
            type="number"
            {...form.register("estimatedValue", { valueAsNumber: true })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
          <Select
            defaultValue={initialStatus}
            onValueChange={(v) => form.setValue("status", v as CreateLeadInput["status"])}
          >
          <SelectTrigger>
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
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...form.register("notes")} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : leadId ? "Update Lead" : "Create Lead"}
      </Button>
    </form>
  );
}
