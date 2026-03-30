import { useState } from "react";
import { motion } from "framer-motion";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getSortedRowModel, flexRender,
  type ColumnDef, type SortingState,
} from "@tanstack/react-table";
import type { PersonaSimResult } from "@shared/types";

interface Props {
  personas: PersonaSimResult[];
}

const DECISION_STYLE: Record<string, string> = {
  buy: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  consider: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  pass: "bg-red-500/15 text-red-400 border border-red-500/30",
};

const DECISION_LABEL: Record<string, string> = {
  buy: "Beli",
  consider: "Pertimbangkan",
  pass: "Tidak Beli",
};

const columns: ColumnDef<PersonaSimResult>[] = [
  {
    accessorKey: "personaName",
    header: "Nama",
    cell: (info) => (
      <span className="font-medium text-white">{info.getValue() as string}</span>
    ),
  },
  {
    accessorKey: "ageGroup",
    header: "Usia",
    cell: (info) => <span className="text-slate-400">{info.getValue() as string}</span>,
  },
  {
    accessorKey: "incomeLevel",
    header: "Income",
    cell: (info) => (
      <span className="text-slate-400 capitalize">
        {(info.getValue() as string).replace("-", " ")}
      </span>
    ),
  },
  {
    accessorKey: "decision",
    header: "Keputusan",
    cell: (info) => {
      const v = info.getValue() as string;
      return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${DECISION_STYLE[v]}`}>
          {DECISION_LABEL[v]}
        </span>
      );
    },
  },
  {
    accessorKey: "willingnessToPay",
    header: "WTP",
    cell: (info) => (
      <span className="text-slate-300 text-xs">
        Rp {(info.getValue() as number).toLocaleString("id-ID")}
      </span>
    ),
  },
  {
    accessorKey: "reasoning",
    header: "Alasan",
    cell: (info) => (
      <span className="text-slate-400 text-xs leading-relaxed">
        {info.getValue() as string}
      </span>
    ),
  },
];

type FilterDecision = "all" | "buy" | "consider" | "pass";

export function PersonaTable({ personas }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filter, setFilter] = useState<FilterDecision>("all");

  const filtered = filter === "all" ? personas : personas.filter((p) => p.decision === filter);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const counts = {
    buy: personas.filter((p) => p.decision === "buy").length,
    consider: personas.filter((p) => p.decision === "consider").length,
    pass: personas.filter((p) => p.decision === "pass").length,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6"
    >
      <h3 className="text-base font-semibold text-white mb-1">Detail per Persona</h3>
      <p className="text-xs text-slate-500 mb-4">Keputusan individual setiap konsumen simulasi</p>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {(["all", "buy", "consider", "pass"] as FilterDecision[]).map((f) => {
          const count = f === "all" ? personas.length : counts[f as keyof typeof counts];
          const isActive = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                isActive
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-500 hover:text-slate-300 border border-transparent"
              }`}
            >
              {f === "all" ? "Semua" : DECISION_LABEL[f]} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="text-left px-3 py-2 text-xs font-medium text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-300 transition border-b border-slate-700"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted() as string] ?? ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, i) => (
              <tr
                key={row.id}
                className={`border-b border-slate-700/50 ${
                  i % 2 === 0 ? "bg-transparent" : "bg-slate-900/20"
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-3 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
