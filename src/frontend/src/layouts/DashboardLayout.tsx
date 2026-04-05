import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { UserProfile } from "../backend";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import AdminPage from "../pages/AdminPage";
import DashboardPage from "../pages/DashboardPage";
import EarningsPage from "../pages/EarningsPage";
import MapViewPage from "../pages/MapViewPage";
import OrdersPage from "../pages/OrdersPage";
import SettingsPage from "../pages/SettingsPage";

export type NavPage =
  | "dashboard"
  | "orders"
  | "map"
  | "earnings"
  | "settings"
  | "admin";

interface Props {
  userProfile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
  isAdmin: boolean;
}

export default function DashboardLayout({
  userProfile,
  onProfileUpdate,
  isAdmin,
}: Props) {
  const [activePage, setActivePage] = useState<NavPage>("dashboard");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        activePage={activePage}
        onPageChange={setActivePage}
        userProfile={userProfile}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activePage={activePage}
          onPageChange={setActivePage}
          isAdmin={isAdmin}
        />
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="min-h-full"
            >
              {activePage === "dashboard" && (
                <DashboardPage
                  userProfile={userProfile}
                  onPageChange={setActivePage}
                />
              )}
              {activePage === "orders" && <OrdersPage />}
              {activePage === "map" && <MapViewPage />}
              {activePage === "earnings" && <EarningsPage />}
              {activePage === "settings" && (
                <SettingsPage
                  userProfile={userProfile}
                  onProfileUpdate={onProfileUpdate}
                />
              )}
              {activePage === "admin" && <AdminPage />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <footer className="border-t border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Help</span>
          <span>Privacy</span>
          <span>Terms</span>
        </div>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()}. Built with &#10084;&#65039; using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
            style={{ color: "var(--color-green)" }}
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
