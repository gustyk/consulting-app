import { NextResponse } from "next/server";
import { runBackup } from "@/lib/backup/run";

// Vercel Cron — runs daily at 02:00 UTC
export async function GET() {
  try {
    const fileName = await runBackup();
    return NextResponse.json({ ok: true, fileName });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 },
    );
  }
}
