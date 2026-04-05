import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, IndianRupee, Package, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useDeliveryHistory, useEarnings } from "../hooks/useQueries";

export default function EarningsPage() {
  const { data: earnings = 0, isLoading: loadingEarnings } = useEarnings();
  const { data: history = [], isLoading: loadingHistory } =
    useDeliveryHistory();

  const totalDeliveries = history.length;
  const avgEarningPerDelivery =
    totalDeliveries > 0 ? earnings / totalDeliveries : 0;

  return (
    <div className="p-5 space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Earnings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your income and delivery history
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <EarningStatCard
          icon={IndianRupee}
          label="Total Earnings"
          value={loadingEarnings ? null : `₹${earnings.toFixed(2)}`}
          color="var(--color-green)"
          bgColor="var(--color-green-dim)"
        />
        <EarningStatCard
          icon={Package}
          label="Total Deliveries"
          value={loadingHistory ? null : totalDeliveries.toString()}
          color="oklch(0.55 0.18 260)"
          bgColor="oklch(0.55 0.18 260 / 0.15)"
        />
        <EarningStatCard
          icon={TrendingUp}
          label="Avg per Delivery"
          value={
            loadingHistory || loadingEarnings
              ? null
              : `₹${avgEarningPerDelivery.toFixed(2)}`
          }
          color="var(--color-amber)"
          bgColor="var(--color-amber-dim)"
        />
      </motion.div>

      {/* History Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Calendar
            className="w-4 h-4"
            style={{ color: "var(--color-green)" }}
          />
          Delivery History
        </h2>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--color-card-border)" }}
        >
          {loadingHistory ? (
            <div
              data-ocid="earnings.history.loading_state"
              className="p-4 space-y-3"
            >
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div
              data-ocid="earnings.history.empty_state"
              className="flex flex-col items-center justify-center py-16"
              style={{ background: "var(--color-card)" }}
            >
              <Package className="w-12 h-12 mb-3 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                No delivery history yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Complete deliveries to see your earnings here
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow
                  style={{
                    background: "var(--color-card)",
                    borderColor: "var(--color-card-border)",
                  }}
                >
                  <TableHead className="text-muted-foreground font-medium text-xs">
                    Order ID
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs">
                    Customer
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs">
                    Drop-off Address
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs">
                    Fee
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-xs">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((order, idx) => (
                  <TableRow
                    key={order.id.toString()}
                    data-ocid={`earnings.history.item.${idx + 1}`}
                    style={{
                      borderColor: "var(--color-card-border)",
                      background:
                        idx % 2 === 0 ? "var(--color-card)" : "transparent",
                    }}
                  >
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      #{order.id.toString()}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {order.customerName}
                    </TableCell>
                    <TableCell className="text-sm text-foreground max-w-[200px] truncate">
                      {order.dropoffAddress}
                    </TableCell>
                    <TableCell
                      className="text-sm font-semibold"
                      style={{ color: "var(--color-green)" }}
                    >
                      ₹{order.deliveryFee.toFixed(0)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="text-xs px-2 py-0.5 border-0"
                        style={{
                          background: "var(--color-green-dim)",
                          color: "var(--color-green)",
                        }}
                      >
                        Delivered
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(
                        Number(order.createdTimestamp / BigInt(1_000_000)),
                      ).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function EarningStatCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  label: string;
  value: string | null;
  color: string;
  bgColor: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex items-start gap-4"
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-card-border)",
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: bgColor }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        {value === null ? (
          <Skeleton className="h-7 w-24" />
        ) : (
          <p className="text-2xl font-bold text-foreground">{value}</p>
        )}
      </div>
    </div>
  );
}
