"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { AddressForm } from "@/components/account/address-form";
import { createAddress, deleteAddress, updateAddress } from "@/lib/addresses/actions";
import type { Address, AddressInput } from "@/lib/addresses/types";

export function AddressBook({ initialAddresses }: { initialAddresses: Address[] }) {
  const t = useTranslations("addresses");
  const confirm = useConfirm();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleAdd(input: AddressInput) {
    const created = await createAddress(input);
    setAddresses((prev) => [created, ...prev]);
    setAdding(false);
  }

  async function handleUpdate(id: string, input: AddressInput) {
    const updated = await updateAddress(id, input);
    setAddresses((prev) => prev.map((a) => (a.id === id ? updated : a)));
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!(await confirm({ message: t("confirmDelete"), danger: true }))) return;
    await deleteAddress(id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      {addresses.length === 0 && !adding && (
        <Card className="p-6 text-muted-foreground">{t("empty")}</Card>
      )}

      {addresses.map((address) =>
        editingId === address.id ? (
          <Card key={address.id} className="p-4">
            <AddressForm
              initialAddress={address}
              onSubmit={(input) => handleUpdate(address.id, input)}
              onCancel={() => setEditingId(null)}
            />
          </Card>
        ) : (
          <Card key={address.id} className="flex items-start justify-between gap-3 p-4 text-sm">
            <p className="text-foreground">
              {address.fullName}
              <br />
              {address.line1}
              {address.line2 && (
                <>
                  <br />
                  {address.line2}
                </>
              )}
              <br />
              {address.city}, {t(`countries.${address.country}`)}
              <br />
              {address.phone}
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setEditingId(address.id)}
                className="text-primary hover:underline"
              >
                {t("edit")}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(address.id)}
                className="text-error hover:underline"
              >
                {t("delete")}
              </button>
            </div>
          </Card>
        ),
      )}

      {adding ? (
        <Card className="p-4">
          <AddressForm onSubmit={handleAdd} onCancel={() => setAdding(false)} />
        </Card>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className={buttonVariants({ variant: "secondary", className: "self-start" })}
        >
          {t("add")}
        </button>
      )}
    </div>
  );
}
