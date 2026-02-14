"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface Due {
  id: string;
  unit_id: string;
  unit_number: string;
  resident_name: string;
  amount: number;
  due_date: string;
  status: string;
  paid_at?: string;
  payment_method?: string;
  description?: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "Bekliyor", color: "bg-yellow-100 text-yellow-800" },
  paid: { label: "Odendi", color: "bg-green-100 text-green-800" },
  overdue: { label: "Gecikti", color: "bg-red-100 text-red-800" },
};

export default function DuesPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const [dues, setDues] = useState<Due[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [bulkForm, setBulkForm] = useState({ amount: 0, due_date: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);

  const loadDues = async () => {
    try {
      const params: { status?: string } = {};
      if (filter) params.status = filter;
      const res = await api.getDues(orgId, params);
      setDues((res.data as Due[]) || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDues(); }, [orgId, filter]);

  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.bulkCreateDues(orgId, bulkForm);
      setShowBulk(false);
      setBulkForm({ amount: 0, due_date: "", description: "" });
      loadDues();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handlePay = async (dueId: string) => {
    setPayingId(dueId);
    try {
      await api.markDuePaid(orgId, dueId, "cash");
      loadDues();
    } catch {
      // ignore
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div>
      <Link href={`/dashboard/organizations/${orgId}`} className="text-sm text-blue-600 hover:underline">&larr; Site Detay</Link>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 mb-6 gap-3">
        <h2 className="text-xl font-bold text-slate-900">Aidatlar</h2>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tumu</option>
            <option value="pending">Bekleyen</option>
            <option value="paid">Odenen</option>
            <option value="overdue">Geciken</option>
          </select>
          <button
            onClick={() => setShowBulk(!showBulk)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + Toplu Aidat
          </button>
        </div>
      </div>

      {showBulk && (
        <form onSubmit={handleBulkCreate} className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h3 className="font-semibold text-slate-900 mb-4">Tum Dairelere Aidat Olustur</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tutar (TL)</label>
              <input
                type="number"
                value={bulkForm.amount || ""}
                onChange={(e) => setBulkForm({ ...bulkForm, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Son Odeme Tarihi</label>
              <input
                type="date"
                value={bulkForm.due_date}
                onChange={(e) => setBulkForm({ ...bulkForm, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Aciklama</label>
              <input
                type="text"
                value={bulkForm.description}
                onChange={(e) => setBulkForm({ ...bulkForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mart 2026 aidati"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Olusturuluyor..." : "Olustur"}
            </button>
            <button type="button" onClick={() => setShowBulk(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100">
              Iptal
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : dues.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">Henuz aidat olusturulmamis</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Daire</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Sakin</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Tutar</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Vade</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Durum</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Islem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dues.map((d) => {
                const status = statusMap[d.status] || statusMap.pending;
                return (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{d.unit_number || "-"}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{d.resident_name || "-"}</td>
                    <td className="px-4 py-3 text-sm text-slate-900 font-medium">{d.amount.toLocaleString("tr-TR")} TL</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{new Date(d.due_date).toLocaleDateString("tr-TR")}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {d.status !== "paid" && (
                        <button
                          onClick={() => handlePay(d.id)}
                          disabled={payingId === d.id}
                          className="text-green-600 hover:text-green-700 text-sm font-medium disabled:opacity-50"
                        >
                          {payingId === d.id ? "..." : "Odendi"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
