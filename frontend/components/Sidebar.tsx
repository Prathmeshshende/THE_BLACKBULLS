import Link from "next/link";

const items = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/live-calls", label: "Live Calls" },
  { href: "/dashboard/crm", label: "CRM" },
  { href: "/dashboard/fraud", label: "Fraud" },
];

export default function Sidebar() {
  return (
    <aside className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 md:w-64">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Dashboard</h2>
      <nav className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
