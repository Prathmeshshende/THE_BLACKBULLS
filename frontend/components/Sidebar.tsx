"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const items = [
  { href: "/dashboard", label: "Overview", icon: "▣" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📈" },
  { href: "/dashboard/live-calls", label: "Live Calls", icon: "📞" },
  { href: "/dashboard/crm", label: "CRM", icon: "🤝" },
  { href: "/dashboard/whatsapp", label: "WhatsApp", icon: "💬" },
  { href: "/dashboard/erp", label: "ERP", icon: "⚙️" },
  { href: "/dashboard/callcenter", label: "Call Center", icon: "🎧" },
  { href: "/dashboard/sales", label: "Sales", icon: "💰" },
  { href: "/dashboard/fraud", label: "Fraud", icon: "🛡️" },
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
    <aside
      className="w-full rounded-2xl p-4 md:w-64"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.10)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)",
      }}
    >
      {/* Header */}
      <div
        className="mb-5 flex items-center gap-2.5 border-b pb-4"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div
          className="h-2 w-2 rounded-full"
          style={{
            background: "#00e5a0",
            boxShadow: "0 0 8px rgba(0,229,160,0.8)",
            animation: "pulse-glow 2.4s ease-in-out infinite",
          }}
        />
        <p
          className="text-xs font-bold uppercase tracking-[0.18em]"
          style={{ color: "rgba(0,229,160,0.7)" }}
        >
          Dashboard
        </p>
      </div>

      {/* Nav Items */}
      <nav className="space-y-1.5">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200"
              style={
                isActive
                  ? {
                    background: "rgba(0,229,160,0.12)",
                    border: "1px solid rgba(0,229,160,0.28)",
                    color: "#00e5a0",
                    boxShadow: "0 0 16px rgba(0,229,160,0.12)",
                  }
                  : {
                    background: "transparent",
                    border: "1px solid transparent",
                    color: "#94a3b8",
                  }
              }
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <span
                  className="ml-auto h-1.5 w-1.5 rounded-full"
                  style={{ background: "#00e5a0", boxShadow: "0 0 6px #00e5a0" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="mt-5 border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-400 transition-all hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            background: "rgba(244,63,94,0.05)",
            border: "1px solid rgba(244,63,94,0.15)",
          }}
        >
          <span>🚪</span>
          {loggingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </aside>
  );
}
