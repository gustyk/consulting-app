function pad(num: number, size = 4): string {
  return num.toString().padStart(size, "0");
}

function ym(): { year: string; month: string } {
  const now = new Date();
  return {
    year: now.getFullYear().toString(),
    month: pad(now.getMonth() + 1, 2),
  };
}

// Sequential counter per prefix (resets yearly via YYYY in number)
// For production, persist counter in DB or use a sequence.
const counters: Record<string, number> = {};

export async function generateProposalNumber(): Promise<string> {
  const { year, month } = ym();
  const key = `PROP/${year}/${month}`;
  counters[key] = (counters[key] ?? 0) + 1;
  return `IBEZA/PROP/${year}/${month}/${pad(counters[key])}`;
}

export async function generateInvoiceNumber(): Promise<string> {
  const { year, month } = ym();
  const key = `INV/${year}/${month}`;
  counters[key] = (counters[key] ?? 0) + 1;
  return `IBEZA/INV/${year}/${month}/${pad(counters[key])}`;
}

export async function generateProjectCode(): Promise<string> {
  const { year, month } = ym();
  const key = `PRJ/${year}/${month}`;
  counters[key] = (counters[key] ?? 0) + 1;
  return `IBEZA/PRJ/${year}/${month}/${pad(counters[key])}`;
}

export async function generateCertificateNumber(): Promise<string> {
  const { year } = ym();
  const key = `TRN/${year}`;
  counters[key] = (counters[key] ?? 0) + 1;
  return `IBEZA/TRN/${year}/${pad(counters[key])}`;
}

export async function generateLeadCode(): Promise<string> {
  const { year } = ym();
  const key = `LD/${year}`;
  counters[key] = (counters[key] ?? 0) + 1;
  return `LD-${year}-${pad(counters[key])}`;
}
