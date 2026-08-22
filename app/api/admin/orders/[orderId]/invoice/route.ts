import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/guard";
import { getAdminOrderById } from "@/lib/admin/orders";
import { getFooterContent } from "@/lib/content/queries";
import { renderOrderInvoicePdf } from "@/lib/orders/invoice-pdf";
import type { Locale } from "@/lib/catalogue/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const auth = await assertAdminApi();
  if (!auth.ok) return auth.response;

  const { orderId } = await params;
  const order = await getAdminOrderById(orderId);
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const locale = (searchParams.get("locale") === "en" ? "en" : "fr") as Locale;

  const footer = await getFooterContent();
  const pdf = await renderOrderInvoicePdf(order, locale, {
    contactEmail: footer.contactEmail,
    contactPhone: footer.contactPhone,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="facture-${orderId.slice(0, 8)}.pdf"`,
    },
  });
}
