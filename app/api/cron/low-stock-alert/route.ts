import { NextResponse } from "next/server";
import { checkAndSendLowStockAlert } from "@/lib/cron/low-stock-alert";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.warn("CRON_SECRET absente — alerte stock désactivée.");
    return NextResponse.json({ skipped: true }, { status: 200 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await checkAndSendLowStockAlert();
  return NextResponse.json(result);
}
