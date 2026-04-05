import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Package, Truck } from "lucide-react";
import { motion } from "motion/react";
import OrderCard from "../components/OrderCard";
import {
  useCompletedOrders,
  useNewOrders,
  useOngoingOrders,
  useOrderActions,
} from "../hooks/useQueries";

export default function OrdersPage() {
  const { data: newOrders = [], isLoading: loadingNew } = useNewOrders();
  const { data: ongoingOrders = [], isLoading: loadingOngoing } =
    useOngoingOrders();
  const { data: completedOrders = [], isLoading: loadingCompleted } =
    useCompletedOrders();
  const { invalidateOrders } = useOrderActions();

  return (
    <div className="p-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <h1 className="text-2xl font-display font-bold text-foreground">
          Orders
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage and track all your delivery orders
        </p>
      </motion.div>

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="mb-5 bg-card border border-border">
          <TabsTrigger
            data-ocid="orders.new.tab"
            value="new"
            className="flex items-center gap-2 data-[state=active]:text-foreground"
          >
            <Package className="w-4 h-4" />
            New
            {newOrders.length > 0 && (
              <span
                className="ml-1 text-xs px-1.5 py-0 rounded-full font-semibold"
                style={{
                  background: "var(--color-green-dim)",
                  color: "var(--color-green)",
                }}
              >
                {newOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            data-ocid="orders.ongoing.tab"
            value="ongoing"
            className="flex items-center gap-2 data-[state=active]:text-foreground"
          >
            <Truck className="w-4 h-4" />
            Ongoing
            {ongoingOrders.length > 0 && (
              <span
                className="ml-1 text-xs px-1.5 py-0 rounded-full font-semibold"
                style={{
                  background: "var(--color-amber-dim)",
                  color: "var(--color-amber)",
                }}
              >
                {ongoingOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            data-ocid="orders.completed.tab"
            value="completed"
            className="flex items-center gap-2 data-[state=active]:text-foreground"
          >
            <CheckCircle className="w-4 h-4" />
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <OrderList
            orders={newOrders}
            loading={loadingNew}
            emptyMessage="No new orders available"
            emptySubtext="Stay online to receive new delivery orders"
            ocidPrefix="orders.new"
            onAction={invalidateOrders}
          />
        </TabsContent>

        <TabsContent value="ongoing">
          <OrderList
            orders={ongoingOrders}
            loading={loadingOngoing}
            emptyMessage="No ongoing deliveries"
            emptySubtext="Accept a new order to start a delivery"
            ocidPrefix="orders.ongoing"
            onAction={invalidateOrders}
          />
        </TabsContent>

        <TabsContent value="completed">
          <OrderList
            orders={completedOrders}
            loading={loadingCompleted}
            emptyMessage="No completed deliveries yet"
            emptySubtext="Completed deliveries will appear here"
            ocidPrefix="orders.completed"
            onAction={invalidateOrders}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OrderList({
  orders,
  loading,
  emptyMessage,
  emptySubtext,
  ocidPrefix,
  onAction,
}: {
  orders: import("../backend").OrderInternal[];
  loading: boolean;
  emptyMessage: string;
  emptySubtext: string;
  ocidPrefix: string;
  onAction: () => void;
}) {
  if (loading) {
    return (
      <div data-ocid={`${ocidPrefix}.loading_state`} className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div
        data-ocid={`${ocidPrefix}.empty_state`}
        className="flex flex-col items-center justify-center py-16 rounded-2xl"
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-card-border)",
        }}
      >
        <Package className="w-12 h-12 mb-3 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">{emptyMessage}</p>
        <p className="text-xs text-muted-foreground mt-1">{emptySubtext}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {orders.map((order, idx) => (
        <OrderCard
          key={order.id.toString()}
          order={order}
          index={idx + 1}
          onOrderAction={onAction}
        />
      ))}
    </div>
  );
}
