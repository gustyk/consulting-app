import { exec } from "node:child_process";
import { promisify } from "node:util";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomUUID } from "node:crypto";

const execAsync = promisify(exec);

// Daily pg_dump backup → private Supabase Storage bucket "backups"
// Runs via Vercel Cron (vercel.json) or GitHub Actions scheduled workflow.
export async function runBackup() {
  const timestamp = new Date().toISOString().slice(0, 10);
  const fileName = `backup-${timestamp}-${randomUUID().slice(0, 8)}.sql`;

  const connectionString = process.env.DATABASE_DIRECT_URL;
  if (!connectionString) throw new Error("DATABASE_DIRECT_URL not set");

  const dump = await execAsync(`pg_dump "${connectionString}" --no-owner --clean`);
  const fileBody = dump.stdout;

  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from("backups")
    .upload(fileName, fileBody, {
      contentType: "application/sql",
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  console.log(`✓ Backup uploaded: ${fileName}`);
  return fileName;
}

// Allow running directly: tsx scripts/backup.ts
if (import.meta.url === `file://${process.argv[1]}`) {
  runBackup()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
