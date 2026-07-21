"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createProposalSchema,
  PROPOSAL_STATUSES,
  type CreateProposalInput,
  type ProposalItem,
} from "../types";
import { createProposal, updateProposal } from "../actions";

type Props = {
  proposalId?: string;
  defaultValues?: Partial<CreateProposalInput>;
  clients: { id: string; name: string; code: string }[];
};

export function ProposalForm({ proposalId, defaultValues, clients }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateProposalInput>({
    resolver: zodResolver(createProposalSchema) as never,
    defaultValues: {
      clientId: "",
      validUntil: undefined,
      items: [{ service: "", description: "", qty: 1, unitPrice: 0, discountPct: 0, taxPct: 11 }],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  function formatCurrency(cents: number) {
    return `Rp${(cents / 100).toLocaleString("id-ID")}`;
  }

  function getItemTotal(item: ProposalItem) {
    const lineSub = item.qty * item.unitPrice;
    const lineDisc = Math.round(lineSub * (item.discountPct / 100));
    const lineTaxable = lineSub - lineDisc;
    const lineTax = Math.round(lineTaxable * (item.taxPct / 100));
    return lineSub - lineDisc + lineTax;
  }

  function getTotals() {
    const items = form.watch("items");
    let subtotal = 0, discount = 0, tax = 0;
    for (const it of items) {
      const lineSub = it.qty * it.unitPrice;
      const lineDisc = Math.round(lineSub * (it.discountPct / 100));
      const lineTaxable = lineSub - lineDisc;
      const lineTax = Math.round(lineTaxable * (it.taxPct / 100));
      subtotal += lineSub;
      discount += lineDisc;
      tax += lineTax;
    }
    return { subtotal, discount, tax, total: subtotal - discount + tax };
  }

  async function onSubmit(values: CreateProposalInput) {
    setLoading(true);
    setError(null);
    try {
      if (proposalId) {
        await updateProposal(proposalId, values);
      } else {
        await createProposal(values);
      }
      router.refresh();
      if (!proposalId) form.reset();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="clientId">Client *</Label>
        <Select
          value={form.watch("clientId") ?? ""}
          onValueChange={(v) => form.setValue("clientId", v || "")}
        >
          <SelectTrigger>
            <span className="flex flex-1 text-left">
              {form.watch("clientId")
                ? clients.find((c) => c.id === form.watch("clientId"))?.name ??
                  form.watch("clientId")
                : "Select client"}
            </span>
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} ({c.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.clientId && (
          <p className="text-sm text-destructive">{form.formState.errors.clientId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="validUntil">Valid Until</Label>
        <Input
          id="validUntil"
          type="date"
          {...form.register("validUntil")}
        />
      </div>

      <div className="space-y-2">
        <Label>Items</Label>
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-7 gap-2 items-end border p-3 rounded">
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Service *</Label>
              <Input
                {...form.register(`items.${index}.service`, { required: "Service required" })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Desc</Label>
              <Input
                {...form.register(`items.${index}.description`)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Qty</Label>
              <Input
                type="number"
                min="1"
                {...form.register(`items.${index}.qty`, { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Unit Price</Label>
              <Input
                type="number"
                min="0"
                {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Disc %</Label>
              <Input
                type="number"
                min="0"
                max="100"
                {...form.register(`items.${index}.discountPct`, { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tax %</Label>
              <Input
                type="number"
                min="0"
                max="100"
                {...form.register(`items.${index}.taxPct`, { valueAsNumber: true })}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                ✕
              </Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => append({ service: "", description: "", qty: 1, unitPrice: 0, discountPct: 0, taxPct: 11 })}>
          + Add Item
        </Button>
      </div>

      <div className="border-t pt-4 space-y-1 text-sm">
        {(() => {
          const totals = getTotals();
          return (
            <>
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(totals.subtotal)}</span></div>
              <div className="flex justify-between"><span>Discount</span><span>{formatCurrency(totals.discount)}</span></div>
              <div className="flex justify-between"><span>Tax (PPN)</span><span>{formatCurrency(totals.tax)}</span></div>
              <div className="flex justify-between font-bold"><span>Total</span><span>{formatCurrency(totals.total)}</span></div>
            </>
          );
        })()}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : proposalId ? "Update Proposal" : "Create Proposal"}
      </Button>
    </form>
  );
}