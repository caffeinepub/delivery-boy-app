import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Bell,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  Map as MapIcon,
  Search,
  Settings,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import type { UserProfile } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import type { NavPage } from "../layouts/DashboardLayout";

const NAV_ITEMS: {
  id: NavPage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "map", label: "Map View", icon: MapIcon },
  { id: "earnings", label: "Earnings", icon: TrendingUp },
  { id: "settings", label: "Settings", icon: Settings },
];

interface Props {
  activePage: NavPage;
  onPageChange: (page: NavPage) => void;
  userProfile: UserProfile;
}

export default function Header({
  activePage,
  onPageChange,
  userProfile,
}: Props) {
  const { clear } = useInternetIdentity();
  const [searchValue, setSearchValue] = useState("");
  const [hasNotification] = useState(true);

  const initials = userProfile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className="flex items-center gap-4 px-5 h-14 border-b border-border flex-shrink-0 z-20"
      style={{ background: "var(--color-header)" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src="/assets/whatsapp_image_2026-03-30_at_10.28.02_pm-019d5c35-841b-7749-aa1d-dc2a98a15173.jpeg"
            alt="Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-sm font-display font-bold text-foreground hidden md:block">
          Delivery Boy App
        </span>
      </div>

      {/* User Avatar */}
      <DropdownMenu>
        <DropdownMenuTrigger data-ocid="header.user.dropdown_menu" asChild>
          <button
            type="button"
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-accent transition-colors outline-none"
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback
                className="text-xs font-bold"
                style={{
                  background: "var(--color-green-dim)",
                  color: "var(--color-green)",
                }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground hidden sm:block">
              {userProfile.name}
            </span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          <DropdownMenuItem
            data-ocid="header.settings.link"
            onClick={() => onPageChange("settings")}
          >
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            data-ocid="header.logout.button"
            onClick={clear}
            className="text-destructive"
          >
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Nav Tabs */}
      <nav className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-hide">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            data-ocid={`nav.${id}.link`}
            onClick={() => onPageChange(id)}
            className={`flex items-center gap-1.5 px-3 h-14 text-sm font-medium whitespace-nowrap transition-colors relative flex-shrink-0 ${
              activePage === id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
            {activePage === id && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                style={{ background: "var(--color-green)" }}
              />
            )}
          </button>
        ))}
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            data-ocid="header.search_input"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-8 h-8 w-44 text-sm bg-input border-border"
          />
        </div>
        <button
          type="button"
          data-ocid="header.notifications.button"
          className="relative p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
          {hasNotification && (
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ background: "var(--color-danger)" }}
            />
          )}
        </button>
      </div>
    </header>
  );
}
