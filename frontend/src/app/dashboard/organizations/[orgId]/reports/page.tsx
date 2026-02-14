"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface MonthlySummary {
  month: number;
  year: number;
  total_dues: number;
  total_paid: number;
  total_overdue: number;
  total_expenses: number;
  balance: number;
  paid_count: number;
  pending_count: number;
  overdue_count: number;
}

interface ExpenseBreakdown {
  category: string;
  amount: number;
  count: number;
}

const categoryLabels: Record<string, string> = {
  maintenance: "Bakim",
  cleaning: "Temizlik",
  electricity: "Elektrik",
  water: "Su",
  elevator: "Asansor",
  other: "Diger",
};

const months = [
  "Ocak", "Subat", "Mart", "Nisan", "Mayis", "Haziran",
  "Temmuz", "Agustos", "Eylul", "Ekim", "Kasim", "Aralik",
];

export default function ReportsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [breakdown, setBreakdown] = useState<ExpenseBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    setLoading(true);
    try {
      const [sumRes, brkRes] = await Promise.all([
        api.getMonthlySummary(orgId, year, month),
        api.getExpenseBreakdown(orgId, year, month),
      ]);
      setSummary(sumRes.data as MonthlySummary);
      setBreakdown((brkRes.data as ExpenseBreakdown[]) || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReport(); }, [orgId, year, month]);

  const totalExpense = breakdown.reduce((s, b) => s + b.amount, 0);

  return (
    <div>
      <Link href={`/dashboard/organizations/${orgId}`} className="text-sm text-blue-600 hover:underline">&larr; Site Detay</Link>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 mb-6 gap-3">
        <h2 className="text-xl font-bold text-slate-900">Aylik Rapor</h2>
        <div className="flex gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {months.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : summary ? (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500 mb-1">Toplam Aidat</p>
              <p className="text-2xl font-bold text-slate-900">{summary.total_dues.toLocaleString("tr-TR")} TL</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500 mb-1">Odenen</p>
              <p className="text-2xl font-bold text-green-600">{summary.total_paid.toLocaleString("tr-TR")} TL</p>
              <p className="text-xs text-slate-400 mt-1">{summary.paid_count} daire odedi</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500 mb-1">Bekleyen</p>
              <p className="text-2xl font-bold text-yellow-600">
                {(summary.total_dues - summary.total_paid - summary.total_overdue).toLocaleString("tr-TR")} TL
              </p>
              <p className="text-xs text-slate-400 mt-1">{summary.pending_count} daire</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500 mb-1">Geciken</p>
              <p className="text-2xl font-bold text-red-600">{summary.total_overdue.toLocaleString("tr-TR")} TL</p>
              <p className="text-xs text-slate-400 mt-1">{summary.overdue_count} daire</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500 mb-1">Toplam Gider</p>
              <p className="text-2xl font-bold text-slate-900">{summary.total_expenses.toLocaleString("tr-TR")} TL</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500 mb-1">Net Bakiye</p>
              <p className={`text-2xl font-bold ${summary.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                {summary.balance.toLocaleString("tr-TR")} TL
              </p>
            </div>
          </div>

          {/* Collection rate bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Tahsilat Orani</span>
              <span className="font-medium text-slate-900">
                {summary.total_dues > 0
                  ? Math.round((summary.total_paid / summary.total_dues) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="bg-green-500 rounded-full h-3 transition-all"
                style={{ width: `${summary.total_dues > 0 ? (summary.total_paid / summary.total_dues) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Expense breakdown */}
          {breakdown.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Gider Dagilimi</h3>
              <div className="space-y-3">
                {breakdown.map((b) => (
                  <div key={b.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-700">{categoryLabels[b.category] || b.category}</span>
                      <span className="text-xs text-slate-400">({b.count} islem)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 rounded-full h-2"
                          style={{ width: `${totalExpense > 0 ? (b.amount / totalExpense) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-900 w-24 text-right">
                        {b.amount.toLocaleString("tr-TR")} TL
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">Bu ay icin veri bulunamadi</p>
        </div>
      )}
    </div>
  );
}
