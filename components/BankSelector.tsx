"use client";
import { useState } from "react";
import { BANKS } from "@/lib/data/banks";
import { ChevronDown, Search } from "lucide-react";

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
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <label className="text-sm font-medium text-gray-700 block mb-1.5">Bank</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full rounded-2xl border bg-gray-50 px-4 py-3.5 text-sm text-left flex items-center justify-between transition-colors ${error ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-gray-400"}`}
      >
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {selected ? selected.name : "Select a bank"}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search banks..."
                className="w-full rounded-xl bg-gray-50 pl-9 pr-4 py-2.5 text-sm outline-none border border-gray-200 focus:border-gray-400"
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
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${value === bank.code ? "text-black font-semibold bg-gray-50" : "text-gray-700"}`}
                >
                  {bank.name}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-sm text-gray-400">No banks found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
