import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMyOrderById } from "@/lib/orders/queries";
import { getFooterContent } from "@/lib/content/queries";
import { renderOrderInvoicePdf } from "@/lib/orders/invoice-pdf";
import type { Locale } from "@/lib/catalogue/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { orderId } = await params;
  // getMyOrderById est RLS-scopée à l'utilisateur connecté (orders_select_own)
  // — renvoie null si la commande n'existe pas ou n'appartient pas à ce
  // compte, jamais confiance dans le seul orderId de l'URL.
  const order = await getMyOrderById(orderId);
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
