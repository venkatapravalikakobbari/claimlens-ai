import { Link } from "@tanstack/react-router";
import { Info, LayoutDashboard, ListChecks, ScrollText, ScanSearch } from "lucide-react";

const nav = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, exact: true },
  { label: "Claims", to: "/claims", icon: ScrollText, exact: false },
  { label: "Review Queue", to: "/review-queue", icon: ListChecks, exact: false },
  { label: "About", to: "/about", icon: Info, exact: false },
] as const;

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <span className="flex size-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <ScanSearch className="size-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-sidebar-accent-foreground">ClaimLens AI</p>
          <p className="text-xs text-sidebar-foreground">Evidence Review Assistant</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">
          Workspace
        </p>
        {nav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.exact }}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-4">
        <p className="text-xs text-sidebar-foreground">AI Assistant • Human Decision</p>
        <p className="mt-1 text-[11px] text-sidebar-foreground/60">Build 2.5.0 - Live backend</p>
      </div>
    </aside>
  );
}
