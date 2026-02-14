"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface Organization {
  id: string;
  name: string;
  address: string;
  total_units: number;
  monthly_due_amount: number;
}

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

const tabs = [
  { key: "units", label: "Daireler", href: "units" },
  { key: "dues", label: "Aidatlar", href: "dues" },
  { key: "expenses", label: "Giderler", href: "expenses" },
  { key: "reports", label: "Raporlar", href: "reports" },
];

export default function OrganizationPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const [org, setOrg] = useState<Organization | null>(null);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [orgRes, summaryRes] = await Promise.all([
          api.getOrganization(orgId),
          api.getMonthlySummary(orgId),
        ]);
        setOrg(orgRes.data as Organization);
        setSummary(summaryRes.data as MonthlySummary);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orgId]);

  if (loading || !org) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">&larr; Sitelerim</Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">{org.name}</h1>
        <p className="text-slate-500 text-sm">{org.address}</p>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Toplam Aidat</p>
            <p className="text-xl font-bold text-slate-900">{summary.total_dues.toLocaleString("tr-TR")} TL</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Odenen</p>
            <p className="text-xl font-bold text-green-600">{summary.total_paid.toLocaleString("tr-TR")} TL</p>
            <p className="text-xs text-slate-400">{summary.paid_count} daire</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Geciken</p>
            <p className="text-xl font-bold text-red-600">{summary.total_overdue.toLocaleString("tr-TR")} TL</p>
            <p className="text-xs text-slate-400">{summary.overdue_count} daire</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Bakiye</p>
            <p className={`text-xl font-bold ${summary.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {summary.balance.toLocaleString("tr-TR")} TL
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/dashboard/organizations/${orgId}/${tab.href}`}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 transition-colors -mb-px"
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="text-center py-8 text-slate-500">
        Yukaridaki sekmelerden birine tiklayin
      </div>
    </div>
  );
}
