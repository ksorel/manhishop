import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAddresses } from "@/lib/addresses/actions";
import { AddressBook } from "@/components/account/address-book";

export const dynamic = "force-dynamic";

export default async function AddressesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("addresses");

  const addresses = await getAddresses();
  if (addresses === null) redirect(`/${locale}/connexion`);

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <div className="mt-6">
        <AddressBook initialAddresses={addresses} />
      </div>
    </div>
  );
}
