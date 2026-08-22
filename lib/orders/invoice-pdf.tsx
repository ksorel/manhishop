import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/catalogue/types";
import type { OrderDetail } from "./queries";

// Contenu bilingue en dur (pas next-intl) — même convention que les
// templates d'email (lib/email/send-order-confirmation.ts), plus simple
// à exécuter hors contexte de requête Next que getTranslations().
const TEXT: Record<Locale, Record<string, string>> = {
  fr: {
    invoice: "Facture",
    orderNumber: "Commande",
    date: "Date",
    status: "Statut",
    seller: "Vendeur",
    buyer: "Client",
    shippingAddress: "Adresse de livraison",
    item: "Article",
    quantity: "Qté",
    unitPrice: "Prix unitaire",
    lineTotal: "Total",
    subtotal: "Sous-total",
    discount: "Réduction",
    pointsRedeemed: "Points de fidélité utilisés",
    delivery: "Livraison",
    total: "Total",
    thanks: "Merci pour votre commande sur Manhishop !",
    legalNotice:
      "RCCM et NIF à compléter dès disponibles — ce document n'est pas encore une facture normalisée au sens fiscal.",
  },
  en: {
    invoice: "Invoice",
    orderNumber: "Order",
    date: "Date",
    status: "Status",
    seller: "Seller",
    buyer: "Customer",
    shippingAddress: "Shipping address",
    item: "Item",
    quantity: "Qty",
    unitPrice: "Unit price",
    lineTotal: "Total",
    subtotal: "Subtotal",
    discount: "Discount",
    pointsRedeemed: "Loyalty points redeemed",
    delivery: "Delivery",
    total: "Total",
    thanks: "Thank you for your order on Manhishop!",
    legalNotice:
      "RCCM and tax ID to be added once available — this document is not yet a tax-compliant invoice.",
  },
};

const STATUS_LABEL: Record<Locale, Record<OrderDetail["status"], string>> = {
  fr: {
    pending: "En attente de paiement",
    paid: "Payée",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
  },
  en: {
    pending: "Awaiting payment",
    paid: "Paid",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  },
};

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica", color: "#1c1f1b" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  brand: { fontSize: 18, fontWeight: 700, color: "#3f7d33" },
  title: { fontSize: 14, fontWeight: 700, textAlign: "right" },
  meta: { fontSize: 10, textAlign: "right", color: "#5b6158", marginTop: 2 },
  columns: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, gap: 20 },
  block: { flexGrow: 1, flexBasis: 0 },
  blockTitle: { fontSize: 9, textTransform: "uppercase", color: "#5b6158", marginBottom: 4, letterSpacing: 0.5 },
  blockLine: { fontSize: 10, marginBottom: 1 },
  table: { marginTop: 8, borderTop: "1px solid #e1ded4" },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottom: "1px solid #1c1f1b",
    paddingVertical: 5,
    fontWeight: 700,
  },
  tableRow: { flexDirection: "row", borderBottom: "1px solid #e1ded4", paddingVertical: 5 },
  colItem: { flexGrow: 1, flexBasis: 0 },
  colQty: { width: 40, textAlign: "right" },
  colPrice: { width: 80, textAlign: "right" },
  colTotal: { width: 80, textAlign: "right" },
  totals: { marginTop: 12, alignSelf: "flex-end", width: 220 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  totalLabel: { color: "#5b6158" },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1px solid #1c1f1b",
    marginTop: 4,
    paddingTop: 4,
    fontWeight: 700,
    fontSize: 12,
  },
  footer: { position: "absolute", bottom: 30, left: 36, right: 36, textAlign: "center" },
  thanks: { fontSize: 10, marginBottom: 4 },
  legalNotice: { fontSize: 7, color: "#a3a795" },
});

interface SellerInfo {
  contactEmail: string;
  contactPhone: string;
}

function InvoiceDocument({ order, locale, seller }: { order: OrderDetail; locale: Locale; seller: SellerInfo }) {
  const t = TEXT[locale];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Text style={styles.brand}>Manhishop</Text>
          <View>
            <Text style={styles.title}>{t.invoice}</Text>
            <Text style={styles.meta}>
              {t.orderNumber} {order.id.slice(0, 8)}
            </Text>
            <Text style={styles.meta}>
              {t.date} : {new Date(order.createdAt).toLocaleDateString(locale)}
            </Text>
            <Text style={styles.meta}>
              {t.status} : {STATUS_LABEL[locale][order.status]}
            </Text>
          </View>
        </View>

        <View style={styles.columns}>
          <View style={styles.block}>
            <Text style={styles.blockTitle}>{t.seller}</Text>
            <Text style={styles.blockLine}>K-NOWLEDGE SARL Unipersonnelle</Text>
            <Text style={styles.blockLine}>Abidjan, Côte d&apos;Ivoire</Text>
            <Text style={styles.blockLine}>RCCM : [à compléter]</Text>
            <Text style={styles.blockLine}>NIF : [à compléter]</Text>
            <Text style={styles.blockLine}>{seller.contactEmail}</Text>
            <Text style={styles.blockLine}>{seller.contactPhone}</Text>
          </View>
          <View style={styles.block}>
            <Text style={styles.blockTitle}>{t.buyer}</Text>
            <Text style={styles.blockLine}>{order.contactEmail}</Text>
            <Text style={styles.blockLine}>{order.contactPhone}</Text>
            {order.address && (
              <>
                <Text style={[styles.blockTitle, { marginTop: 8 }]}>{t.shippingAddress}</Text>
                <Text style={styles.blockLine}>{order.address.fullName}</Text>
                <Text style={styles.blockLine}>{order.address.line1}</Text>
                {order.address.line2 && <Text style={styles.blockLine}>{order.address.line2}</Text>}
                <Text style={styles.blockLine}>
                  {order.address.city}, {order.address.country}
                </Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.colItem}>{t.item}</Text>
            <Text style={styles.colQty}>{t.quantity}</Text>
            <Text style={styles.colPrice}>{t.unitPrice}</Text>
            <Text style={styles.colTotal}>{t.lineTotal}</Text>
          </View>
          {order.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colItem}>
                {item.productName}
                {item.sizeLabel ? ` (${item.sizeLabel})` : ""}
              </Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatPrice(item.unitPrice, locale)}</Text>
              <Text style={styles.colTotal}>{formatPrice(item.unitPrice * item.quantity, locale)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t.subtotal}</Text>
            <Text>{formatPrice(order.subtotal, locale)}</Text>
          </View>
          {order.discountAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t.discount}</Text>
              <Text>-{formatPrice(order.discountAmount, locale)}</Text>
            </View>
          )}
          {order.pointsRedeemed > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t.pointsRedeemed}</Text>
              <Text>{order.pointsRedeemed}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t.delivery}</Text>
            <Text>{formatPrice(order.deliveryFee, locale)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text>{t.total}</Text>
            <Text>{formatPrice(order.total, locale)}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.thanks}>{t.thanks}</Text>
          <Text style={styles.legalNotice}>{t.legalNotice}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function renderOrderInvoicePdf(
  order: OrderDetail,
  locale: Locale,
  seller: SellerInfo,
): Promise<Buffer> {
  return renderToBuffer(<InvoiceDocument order={order} locale={locale} seller={seller} />);
}
