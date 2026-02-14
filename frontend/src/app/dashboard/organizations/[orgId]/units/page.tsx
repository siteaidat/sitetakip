"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface Unit {
  id: string;
  unit_number: string;
  floor: number;
  resident_name?: string;
}

export default function UnitsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ unit_number: "", floor: 1 });
  const [saving, setSaving] = useState(false);

  const loadUnits = async () => {
    try {
      const res = await api.getUnits(orgId);
      setUnits((res.data as Unit[]) || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUnits(); }, [orgId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createUnit(orgId, form);
      setShowForm(false);
      setForm({ unit_number: "", floor: 1 });
      loadUnits();
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
        <h2 className="text-xl font-bold text-slate-900">Daireler</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Daire Ekle
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Daire No</label>
              <input
                type="text"
                value={form.unit_number}
                onChange={(e) => setForm({ ...form, unit_number: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kat</label>
              <input
                type="number"
                value={form.floor}
                onChange={(e) => setForm({ ...form, floor: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      ) : units.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">Henuz daire eklenmemis</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Daire No</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Kat</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Sakin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {units.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{u.unit_number}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{u.floor}. Kat</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{u.resident_name || <span className="text-slate-400">Atanmamis</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
