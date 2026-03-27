"use client";
import { BANKS } from "@/lib/data/banks";
import { ChevronDown, Search } from "lucide-react";
import { useState } from "react";

interface Props {
  value: string;
  onChange: (code: string) => void;
  error?: string;
}

export function BankSelector({ value, onChange, error }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = BANKS.find((b) => b.code === value);
  const filtered = BANKS.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative">
      <label className="text-sm font-medium text-app-primary block mb-1.5">
        Bank
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full rounded-2xl border px-4 py-3.5 text-sm text-left flex items-center justify-between transition-colors bg-background-secondary border-border hover:border-input-focus ${error ? "border-error bg-red-900/10" : ""}`}
      >
        <span className={selected ? "text-app-primary" : "text-app-tertiary"}>
          {selected ? selected.name : "Select a bank"}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-app-tertiary transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {error && <p className="text-xs text-error mt-1">{error}</p>}

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-background-secondary rounded-2xl border border-border shadow-xl overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-tertiary" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search banks..."
                className="w-full rounded-xl bg-background border border-border pl-9 pr-4 py-2.5 text-sm outline-none focus:border-input-focus text-app-primary placeholder:text-app-tertiary"
              />
            </div>
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.map((bank) => (
              <li key={bank.code}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(bank.code);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${value === bank.code ? "text-app-primary font-semibold bg-background hover:bg-background" : "text-app-secondary hover:bg-border"}`}
                >
                  {bank.name}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-sm text-app-tertiary">
                No banks found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
