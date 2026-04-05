import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Map as MapIcon,
  Settings,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import type { NavPage } from "../layouts/DashboardLayout";

const BASE_SIDEBAR_ITEMS: {
  id: NavPage;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  label: string;
  adminOnly?: boolean;
}[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "orders", icon: ClipboardList, label: "Orders" },
  { id: "map", icon: MapIcon, label: "Map View" },
  { id: "earnings", icon: TrendingUp, label: "Earnings" },
  { id: "admin", icon: ShieldCheck, label: "Admin", adminOnly: true },
  { id: "settings", icon: Settings, label: "Settings" },
];

interface Props {
  activePage: NavPage;
  onPageChange: (page: NavPage) => void;
  isAdmin: boolean;
}

export default function Sidebar({ activePage, onPageChange, isAdmin }: Props) {
  const { clear } = useInternetIdentity();

  const visibleItems = BASE_SIDEBAR_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin,
  );

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        className="w-14 flex flex-col items-center py-4 gap-2 border-r border-border flex-shrink-0"
        style={{ background: "var(--color-header)" }}
      >
        <div className="flex flex-col items-center gap-1 flex-1">
          {visibleItems.map(({ id, icon: Icon, label }) => (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  data-ocid={`sidebar.${id}.link`}
                  onClick={() => onPageChange(id)}
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    activePage === id
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                  style={
                    activePage === id
                      ? { background: "var(--color-green-dim)" }
                      : {}
                  }
                >
                  {activePage === id && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full"
                      style={{ background: "var(--color-green)" }}
                    />
                  )}
                  <Icon
                    className={`w-5 h-5${activePage === id ? " [&>*]:fill-none" : ""}`}
                    style={
                      activePage === id ? { color: "var(--color-green)" } : {}
                    }
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              data-ocid="sidebar.logout.button"
              onClick={clear}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Sign Out</p>
          </TooltipContent>
        </Tooltip>
      </aside>
    </TooltipProvider>
  );
}
