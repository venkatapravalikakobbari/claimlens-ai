import { Link } from "@tanstack/react-router";
import { Bell, ScanSearch, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function TopHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card">
      <div className="flex flex-wrap items-center gap-4 px-6 py-3">
        <Link to="/" className="flex items-center gap-2 lg:hidden">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ScanSearch className="size-4" />
          </span>
          <span className="text-sm font-semibold">ClaimLens AI</span>
        </Link>

        <div className="relative hidden max-w-sm flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search claim ID, customer or policy" className="pl-9" />
        </div>

        <div className="ml-auto flex items-center gap-4">
          <span className="hidden rounded border border-border bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground sm:inline">
            AI Assistant • Human Decision
          </span>
          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Bell className="size-4" />
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-danger" />
          </button>
          <div className="flex items-center gap-2 border-l border-border pl-4">
            <span className="flex size-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
              VK
            </span>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium leading-tight text-foreground">V. Kobbari</p>
              <p className="text-xs leading-tight text-muted-foreground">Senior Investigator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
