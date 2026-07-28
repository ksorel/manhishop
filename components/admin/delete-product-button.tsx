"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { deleteProduct } from "@/lib/admin/products";
import { buttonVariants } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";

export function DeleteProductButton({ productId }: { productId: string }) {
  const t = useTranslations("admin.products");
  const router = useRouter();
  const confirm = useConfirm();

  async function handleClick() {
    if (!(await confirm({ message: t("confirmDelete"), danger: true }))) return;
    await deleteProduct(productId);
    router.push("/admin/produits");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={buttonVariants({ variant: "text", className: "text-error" })}
    >
      {t("delete")}
    </button>
  );
}
