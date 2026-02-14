"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
}

const categoryLabels: Record<string, string> = {
  maintenance: "Bakim",
  cleaning: "Temizlik",
  electricity: "Elektrik",
  water: "Su",
  elevator: "Asansor",
  other: "Diger",
};

export default function ExpensesPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: "maintenance", amount: 0, date: "", description: "" });
  const [saving, setSaving] = useState(false);

  const loadExpenses = async () => {
    try {
      const res = await api.getExpenses(orgId);
      setExpenses((res.data as Expense[]) || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadExpenses(); }, [orgId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createExpense(orgId, form);
      setShowForm(false);
      setForm({ category: "maintenance", amount: 0, date: "", description: "" });
      loadExpenses();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Link href={`/dashboard/organizations/${orgId}`} className="text-sm text-blue-600 hover:underline">&larr; Site Detay</Link>

      <div className="flex items-center justify-between mt-4 mb-6">
        <h2 className="text-xl font-bold text-slate-900">Giderler</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Gider Ekle
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tutar (TL)</label>
              <input
                type="number"
                value={form.amount || ""}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tarih</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Aciklama</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Asansor bakimi"
                required
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100">
              Iptal
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">Henuz gider eklenmemis</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Kategori</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Aciklama</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Tutar</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {categoryLabels[exp.category] || exp.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{exp.description}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{exp.amount.toLocaleString("tr-TR")} TL</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{new Date(exp.date).toLocaleDateString("tr-TR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
