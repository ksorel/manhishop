"use client";

import { useLocale } from "next-intl";
import type { Locale, SizeGuideContent } from "@/lib/catalogue/types";

export function SizeGuideTable({ content }: { content: SizeGuideContent }) {
  const locale = useLocale() as Locale;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max border-collapse text-sm">
        <thead>
          <tr>
            {content.headers.map((header, index) => (
              <th
                key={index}
                className="border-b border-border px-3 py-2 text-left font-medium text-foreground"
              >
                {locale === "fr" ? header.fr : header.en}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {content.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border-b border-border px-3 py-2 text-muted-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
