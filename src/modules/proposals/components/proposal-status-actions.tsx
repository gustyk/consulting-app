"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  submitProposalForApproval,
  approveProposal,
  sendProposal,
  acceptProposal,
  rejectProposal,
} from "../actions";

type Proposal = {
  id: string;
  status: string;
};

export function ProposalStatusActions({ proposal }: { proposal: Proposal }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function action(fn: (id: string) => Promise<unknown>) {
    setBusy(true);
    try {
      await fn(proposal.id);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {proposal.status === "draft" && (
        <Button disabled={busy} onClick={() => action(() => submitProposalForApproval(proposal.id))}>
          Submit for Approval
        </Button>
      )}
      {proposal.status === "waiting_approval" && (
        <Button disabled={busy} onClick={() => action(async () => {
          await approveProposal({ id: proposal.id });
        })}>
          Approve
        </Button>
      )}
      {proposal.status === "approved" && (
        <Button disabled={busy} onClick={() => action(async () => {
          await sendProposal({ id: proposal.id });
        })}>
          Mark as Sent
        </Button>
      )}
      {proposal.status === "sent" && (
        <>
          <Button disabled={busy} variant="default" onClick={() => action(async () => {
            await acceptProposal({ id: proposal.id });
          })}>
            Accept
          </Button>
          <Button disabled={busy} variant="destructive" onClick={() => action(async () => {
            await rejectProposal({ id: proposal.id });
          })}>
            Reject
          </Button>
        </>
      )}
    </div>
  );
}