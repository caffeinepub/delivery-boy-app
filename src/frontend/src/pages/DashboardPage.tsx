import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  ChevronRight,
  Clock,
  Package,
  Star,
  TrendingUp,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend";
import LeafletMap from "../components/LeafletMap";
import OrderCard from "../components/OrderCard";
import { useActor } from "../hooks/useActor";
import {
  useCompletedOrders,
  useEarnings,
  useNewOrders,
  useOngoingOrders,
  useOrderActions,
} from "../hooks/useQueries";
import type { NavPage } from "../layouts/DashboardLayout";

// Tirupati delivery route on dashboard mini-map
const TIRUPATI_ROUTE: [number, number][] = [
  [13.6288, 79.4192], // Railway Station
  [13.634, 79.415], // Balaji Colony
  [13.6507, 79.4132], // Alipiri
  [13.662, 79.425], // Srinivasa Nagar
  [13.6833, 79.3478], // Tirumala
];

const MAP_MARKERS = [
  {
    lat: 13.6288,
    lng: 79.4192,
    color: "#ef4444",
    label: "Pickup: Railway Station",
  },
  { lat: 13.6833, lng: 79.3478, color: "#2ECC71", label: "Dropoff: Tirumala" },
];

interface Props {
  userProfile: UserProfile;
  onPageChange: (page: NavPage) => void;
}

export default function DashboardPage({ userProfile, onPageChange }: Props) {
  const { actor } = useActor();
  const [isOnline, setIsOnline] = useState(userProfile.isOnline);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const { invalidateOrders } = useOrderActions();

  const { data: newOrders = [], isLoading: loadingNew } = useNewOrders();
  const { data: ongoingOrders = [], isLoading: loadingOngoing } =
    useOngoingOrders();
  const { data: completedOrders = [], isLoading: loadingCompleted } =
    useCompletedOrders();
  const { data: earnings = 0 } = useEarnings();

  const handleToggleOnline = async (value: boolean) => {
    if (!actor) return;
    setTogglingStatus(true);
    try {
      await actor.setDeliveryBoyOnlineStatus(value);
      setIsOnline(value);
      toast.success(value ? "You are now online" : "You are now offline");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setTogglingStatus(false);
    }
  };

  return (
    <div className="p-5 space-y-5">
      {/* Greeting Row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Hello, {userProfile.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here's your live order overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {isOnline ? "Online" : "Offline"}
          </span>
          <div className="flex items-center gap-2">
            {isOnline && (
              <span
                className="w-2 h-2 rounded-full animate-pulse-green"
                style={{ background: "var(--color-green)" }}
              />
            )}
            <Switch
              data-ocid="dashboard.online_status.switch"
              checked={isOnline}
              onCheckedChange={handleToggleOnline}
              disabled={togglingStatus}
              style={isOnline ? { backgroundColor: "var(--color-green)" } : {}}
            />
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* New Orders */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          data-ocid="dashboard.new_orders.section"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Package
                className="w-4 h-4"
                style={{ color: "var(--color-green)" }}
              />
              New Orders
              {newOrders.length > 0 && (
                <Badge
                  className="text-xs px-1.5 py-0 border-0"
                  style={{
                    background: "var(--color-green-dim)",
                    color: "var(--color-green)",
                  }}
                >
                  {newOrders.length}
                </Badge>
              )}
            </h2>
            <button
              type="button"
              data-ocid="dashboard.view_all_orders.button"
              onClick={() => onPageChange("orders")}
              className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {loadingNew ? (
              [1, 2].map((i) => (
                <Skeleton key={i} className="h-40 rounded-2xl" />
              ))
            ) : newOrders.length === 0 ? (
              <div
                data-ocid="dashboard.new_orders.empty_state"
                className="rounded-2xl p-6 text-center"
                style={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-card-border)",
                }}
              >
                <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No new orders right now
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Stay online to receive orders
                </p>
              </div>
            ) : (
              newOrders
                .slice(0, 3)
                .map((order, idx) => (
                  <OrderCard
                    key={order.id.toString()}
                    order={order}
                    index={idx + 1}
                    onOrderAction={invalidateOrders}
                  />
                ))
            )}
          </div>
        </motion.section>

        {/* Map */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          data-ocid="dashboard.map.section"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">
              Live Map — Tirupati
            </h2>
            <button
              type="button"
              data-ocid="dashboard.fullmap.button"
              onClick={() => onPageChange("map")}
              className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              Full map <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--color-card-border)" }}
          >
            <LeafletMap
              center={[13.6507, 79.4]}
              zoom={12}
              markers={MAP_MARKERS}
              routePoints={TIRUPATI_ROUTE}
              className="h-64"
            />
          </div>
        </motion.section>

        {/* Pending Deliveries (Ongoing) */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          data-ocid="dashboard.pending.section"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Truck
                className="w-4 h-4"
                style={{ color: "var(--color-amber)" }}
              />
              Pending Deliveries
            </h2>
          </div>
          <div className="space-y-2">
            {loadingOngoing ? (
              [1, 2].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))
            ) : ongoingOrders.length === 0 ? (
              <div
                data-ocid="dashboard.pending.empty_state"
                className="rounded-xl p-5 text-center"
                style={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-card-border)",
                }}
              >
                <p className="text-sm text-muted-foreground">
                  No pending deliveries
                </p>
              </div>
            ) : (
              ongoingOrders.slice(0, 4).map((order, idx) => (
                <div
                  key={order.id.toString()}
                  data-ocid={`dashboard.pending.item.${idx + 1}`}
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-card-border)",
                  }}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Order #{order.id.toString()}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {order.dropoffAddress}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className="text-xs px-2 py-0.5 border-0"
                      style={{
                        background: "var(--color-amber-dim)",
                        color: "var(--color-amber)",
                      }}
                    >
                      In Transit
                    </Badge>
                    <span className="text-sm font-semibold text-foreground">
                      ₹{order.deliveryFee.toFixed(0)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.section>

        {/* Daily Summary */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          data-ocid="dashboard.summary.section"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">
              Daily Summary
            </h2>
          </div>
          <div
            className="rounded-2xl p-5"
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-card-border)",
            }}
          >
            {loadingCompleted ? (
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <MetricCard
                  icon={TrendingUp}
                  label="Today's Earnings"
                  value={`₹${earnings.toFixed(0)}`}
                  color="var(--color-green)"
                />
                <MetricCard
                  icon={Package}
                  label="Deliveries Completed"
                  value={completedOrders.length.toString()}
                  color="oklch(0.55 0.18 260)"
                />
                <MetricCard
                  icon={Clock}
                  label="Hours Worked"
                  value="8h"
                  color="var(--color-amber)"
                />
                <MetricCard
                  icon={Star}
                  label="Rating"
                  value="4.8 ★"
                  color="oklch(0.80 0.20 70)"
                />
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-2"
      style={{ background: "oklch(var(--muted))" }}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}
