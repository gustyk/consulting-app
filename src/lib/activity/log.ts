import { prisma } from "@/lib/prisma/client";

type LogInput = {
  action: string;
  actorId?: string | null;
  actorName?: string | null;
  targetType?: string;
  targetId?: string;
  previousValue?: unknown;
  metadata?: unknown;
};

export async function logActivity(input: LogInput): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        action: input.action,
        actorId: input.actorId,
        actorName: input.actorName,
        targetType: input.targetType,
        targetId: input.targetId,
        previousValue: input.previousValue as object | undefined,
        metadata: input.metadata as object | undefined,
      },
    });
  } catch (err) {
    // Activity logging must never break the main mutation
    console.error("logActivity failed:", err);
  }
}
