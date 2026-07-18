"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CategoryIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/types";

export function SearchFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const category = params.get("category") ?? "";
  const q = params.get("q") ?? "";
  const maxPrice = params.get("maxPrice") ?? "";

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.push(`/listings?${next.toString()}`);
    },
    [params, router],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setParam("category", "")}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm transition-colors",
            category === ""
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:bg-accent",
          )}
        >
          Alla
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setParam("category", c.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
              category === c.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-accent",
            )}
          >
            <CategoryIcon category={c.key} className="size-4" /> {c.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <Input
          defaultValue={q}
          placeholder="Sök på område, t.ex. Södermalm"
          onKeyDown={(e) => {
            if (e.key === "Enter") setParam("q", (e.target as HTMLInputElement).value);
          }}
        />
        <Select value={maxPrice} onChange={(e) => setParam("maxPrice", e.target.value)}>
          <option value="">Valfritt pris</option>
          <option value="1000">Upp till 1 000 kr</option>
          <option value="1500">Upp till 1 500 kr</option>
          <option value="2000">Upp till 2 000 kr</option>
          <option value="3000">Upp till 3 000 kr</option>
        </Select>
      </div>
    </div>
  );
}
