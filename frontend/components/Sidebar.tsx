"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const items = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/live-calls", label: "Live Calls" },
  { href: "/dashboard/crm", label: "CRM" },
  { href: "/dashboard/whatsapp", label: "WhatsApp" },
  { href: "/dashboard/erp", label: "ERP" },
  { href: "/dashboard/callcenter", label: "Call Center" },
  { href: "/dashboard/sales", label: "Sales" },
  { href: "/dashboard/fraud", label: "Fraud" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/dashboard-logout", { method: "POST" });
      router.push("/dashboard-login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 md:w-64">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Dashboard</h2>
      <nav className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
              pathname === item.href
                ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-200"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-900"
      >
        {loggingOut ? "Signing out..." : "Sign out"}
      </button>
    </aside>
  );
}
