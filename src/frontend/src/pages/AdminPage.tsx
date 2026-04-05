import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  Loader2,
  Package,
  RefreshCw,
  ShieldCheck,
  Truck,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatus } from "../backend";
import type { OrderInternal } from "../backend";
import { useActor } from "../hooks/useActor";
import {
  useAllDeliveryBoys,
  useCompletedOrders,
  useCreateOrder,
  useNewOrders,
  useOngoingOrders,
  useRejectedOrders,
} from "../hooks/useQueries";

// ─── Status badge helper ───────────────────────────────────────────────────
function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; bg: string; color: string }> =
    {
      [OrderStatus.new_]: {
        label: "New",
        bg: "var(--color-green-dim)",
        color: "var(--color-green)",
      },
      [OrderStatus.ongoing]: {
        label: "Ongoing",
        bg: "var(--color-amber-dim)",
        color: "var(--color-amber)",
      },
      [OrderStatus.completed]: {
        label: "Completed",
        bg: "oklch(0.25 0.04 145)",
        color: "oklch(0.72 0.18 145)",
      },
      [OrderStatus.rejected]: {
        label: "Rejected",
        bg: "oklch(0.22 0.04 20)",
        color: "oklch(0.65 0.2 20)",
      },
    };
  const s = map[status];
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

// ─── Order row card ────────────────────────────────────────────────────────
function OrderRow({ order, index }: { order: OrderInternal; index: number }) {
  return (
    <Card
      data-ocid={`admin.orders.item.${index}`}
      className="border"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-card-border)",
      }}
    >
      <CardContent className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-mono">
              #{order.id.toString()}
            </p>
            <p className="font-semibold text-foreground truncate">
              {order.customerName}
            </p>
            <p className="text-xs text-muted-foreground">
              {order.customerPhone}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <StatusBadge status={order.status} />
            <span
              className="text-sm font-bold"
              style={{ color: "var(--color-green)" }}
            >
              ₹{order.deliveryFee}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div
            className="rounded-lg p-2"
            style={{ background: "var(--color-green-dim)" }}
          >
            <p
              className="text-xs font-semibold mb-0.5"
              style={{ color: "var(--color-green)" }}
            >
              Pickup
            </p>
            <p className="text-xs text-foreground leading-tight">
              {order.pickupAddress}
            </p>
          </div>
          <div
            className="rounded-lg p-2"
            style={{ background: "var(--color-amber-dim)" }}
          >
            <p
              className="text-xs font-semibold mb-0.5"
              style={{ color: "var(--color-amber)" }}
            >
              Dropoff
            </p>
            <p className="text-xs text-foreground leading-tight">
              {order.dropoffAddress}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{order.distanceKm} km</p>
      </CardContent>
    </Card>
  );
}

// ─── Admin Orders Tab ──────────────────────────────────────────────────────
function AdminOrdersTab() {
  const { data: newOrders = [], isLoading: loadingNew } = useNewOrders();
  const { data: ongoingOrders = [], isLoading: loadingOngoing } =
    useOngoingOrders();
  const { data: completedOrders = [], isLoading: loadingCompleted } =
    useCompletedOrders();
  const { data: rejectedOrders = [], isLoading: loadingRejected } =
    useRejectedOrders();

  function OrderListSection({
    orders,
    loading,
    emptyMsg,
    ocidPrefix,
  }: {
    orders: OrderInternal[];
    loading: boolean;
    emptyMsg: string;
    ocidPrefix: string;
  }) {
    if (loading) {
      return (
        <div
          data-ocid={`${ocidPrefix}.loading_state`}
          className="space-y-3 mt-4"
        >
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      );
    }
    if (orders.length === 0) {
      return (
        <div
          data-ocid={`${ocidPrefix}.empty_state`}
          className="flex flex-col items-center justify-center py-14 rounded-xl mt-4"
          style={{
            background: "var(--color-card)",
            border: "1px solid var(--color-card-border)",
          }}
        >
          <Package className="w-10 h-10 mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{emptyMsg}</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
        {orders.map((order, idx) => (
          <OrderRow key={order.id.toString()} order={order} index={idx + 1} />
        ))}
      </div>
    );
  }

  return (
    <Tabs defaultValue="new" className="w-full">
      <TabsList className="bg-card border border-border">
        <TabsTrigger
          data-ocid="admin.orders.new.tab"
          value="new"
          className="flex items-center gap-1.5 data-[state=active]:text-foreground"
        >
          <Package className="w-4 h-4" /> New
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
          data-ocid="admin.orders.ongoing.tab"
          value="ongoing"
          className="flex items-center gap-1.5 data-[state=active]:text-foreground"
        >
          <Truck className="w-4 h-4" /> Ongoing
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
          data-ocid="admin.orders.completed.tab"
          value="completed"
          className="flex items-center gap-1.5 data-[state=active]:text-foreground"
        >
          <CheckCircle className="w-4 h-4" /> Completed
        </TabsTrigger>
        <TabsTrigger
          data-ocid="admin.orders.rejected.tab"
          value="rejected"
          className="flex items-center gap-1.5 data-[state=active]:text-foreground"
        >
          <XCircle className="w-4 h-4" /> Rejected
        </TabsTrigger>
      </TabsList>

      <TabsContent value="new">
        <OrderListSection
          orders={newOrders}
          loading={loadingNew}
          emptyMsg="No new orders"
          ocidPrefix="admin.orders.new"
        />
      </TabsContent>
      <TabsContent value="ongoing">
        <OrderListSection
          orders={ongoingOrders}
          loading={loadingOngoing}
          emptyMsg="No ongoing orders"
          ocidPrefix="admin.orders.ongoing"
        />
      </TabsContent>
      <TabsContent value="completed">
        <OrderListSection
          orders={completedOrders}
          loading={loadingCompleted}
          emptyMsg="No completed orders yet"
          ocidPrefix="admin.orders.completed"
        />
      </TabsContent>
      <TabsContent value="rejected">
        <OrderListSection
          orders={rejectedOrders}
          loading={loadingRejected}
          emptyMsg="No rejected orders"
          ocidPrefix="admin.orders.rejected"
        />
      </TabsContent>
    </Tabs>
  );
}

// ─── Create Order Tab ──────────────────────────────────────────────────────
function CreateOrderTab() {
  const createOrder = useCreateOrder();
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    pickupAddress: "",
    dropoffAddress: "",
    distanceKm: "",
    deliveryFee: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.customerName ||
      !form.customerPhone ||
      !form.pickupAddress ||
      !form.dropoffAddress ||
      !form.distanceKm ||
      !form.deliveryFee
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await createOrder.mutateAsync({
        id: 0n,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        pickupAddress: form.pickupAddress,
        dropoffAddress: form.dropoffAddress,
        distanceKm: Number(form.distanceKm),
        deliveryFee: Number(form.deliveryFee),
        status: OrderStatus.new_,
        assignedDeliveryBoy: undefined,
        createdTimestamp: 0n,
      });
      toast.success("Order created successfully!");
      setForm({
        customerName: "",
        customerPhone: "",
        pickupAddress: "",
        dropoffAddress: "",
        distanceKm: "",
        deliveryFee: "",
      });
    } catch {
      toast.error("Failed to create order. Please try again.");
    }
  };

  return (
    <Card
      className="border max-w-2xl"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-card-border)",
      }}
    >
      <CardContent className="p-6">
        <form
          data-ocid="admin.create_order.panel"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                data-ocid="admin.create_order.input"
                placeholder="e.g. Ravi Kumar"
                value={form.customerName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customerName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customerPhone">Customer Phone</Label>
              <Input
                id="customerPhone"
                placeholder="e.g. 9876543210"
                value={form.customerPhone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customerPhone: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pickupAddress">Pickup Address</Label>
            <Input
              id="pickupAddress"
              placeholder="e.g. Tirupati Railway Station, Tirupati"
              value={form.pickupAddress}
              onChange={(e) =>
                setForm((f) => ({ ...f, pickupAddress: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dropoffAddress">Dropoff Address</Label>
            <Input
              id="dropoffAddress"
              placeholder="e.g. Alipiri, Tirupati"
              value={form.dropoffAddress}
              onChange={(e) =>
                setForm((f) => ({ ...f, dropoffAddress: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="distanceKm">Distance (km)</Label>
              <Input
                id="distanceKm"
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g. 5.2"
                value={form.distanceKm}
                onChange={(e) =>
                  setForm((f) => ({ ...f, distanceKm: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deliveryFee">Delivery Fee (₹)</Label>
              <Input
                id="deliveryFee"
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 80"
                value={form.deliveryFee}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deliveryFee: e.target.value }))
                }
              />
            </div>
          </div>
          <Button
            type="submit"
            data-ocid="admin.create_order.submit_button"
            disabled={createOrder.isPending}
            className="w-full font-semibold"
            style={{
              background: "var(--color-green)",
              color: "oklch(0.12 0.02 145)",
            }}
          >
            {createOrder.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Order"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Delivery Boys Tab ─────────────────────────────────────────────────────
function DeliveryBoysTab() {
  const { data: deliveryBoys = [], isLoading } = useAllDeliveryBoys();

  if (isLoading) {
    return (
      <div
        data-ocid="admin.delivery_boys.loading_state"
        className="space-y-3 mt-4"
      >
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (deliveryBoys.length === 0) {
    return (
      <div
        data-ocid="admin.delivery_boys.empty_state"
        className="flex flex-col items-center justify-center py-14 rounded-xl mt-4"
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-card-border)",
        }}
      >
        <Users className="w-10 h-10 mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No delivery boys registered yet
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
      {deliveryBoys.map((boy, idx) => (
        <Card
          key={`${boy.name}-${boy.phoneNumber}`}
          data-ocid={`admin.delivery_boys.item.${idx + 1}`}
          className="border"
          style={{
            background: "var(--color-card)",
            borderColor: "var(--color-card-border)",
          }}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "var(--color-green-dim)" }}
            >
              <UserCheck
                className="w-5 h-5"
                style={{ color: "var(--color-green)" }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {boy.name}
              </p>
              <p className="text-xs text-muted-foreground">{boy.phoneNumber}</p>
            </div>
            <Badge
              variant="outline"
              className="shrink-0 text-xs font-semibold border"
              style={{
                background: boy.isOnline
                  ? "var(--color-green-dim)"
                  : "var(--color-card)",
                color: boy.isOnline
                  ? "var(--color-green)"
                  : "var(--color-muted-foreground)",
                borderColor: boy.isOnline
                  ? "var(--color-green)"
                  : "var(--color-card-border)",
              }}
            >
              {boy.isOnline ? "Online" : "Offline"}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Sample Data Tab ───────────────────────────────────────────────────────
function SampleDataTab() {
  const { actor } = useActor();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleReseed = async () => {
    if (!actor) {
      toast.error("Not connected to backend");
      return;
    }
    setIsSeeding(true);
    try {
      await actor.createSampleOrders();
      localStorage.removeItem("sampleOrdersSeeded");
      toast.success("Sample orders re-seeded! They will reload on next login.");
    } catch {
      toast.error("Failed to seed sample orders.");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="mt-4 max-w-xl">
      <Card
        className="border"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-card-border)",
        }}
      >
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: "var(--color-amber-dim)" }}
            >
              <RefreshCw
                className="w-5 h-5"
                style={{ color: "var(--color-amber)" }}
              />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Re-seed Sample Orders
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                This will call{" "}
                <code className="text-xs bg-muted px-1 rounded">
                  createSampleOrders()
                </code>{" "}
                on the backend and also clear the{" "}
                <code className="text-xs bg-muted px-1 rounded">
                  sampleOrdersSeeded
                </code>{" "}
                flag in localStorage so orders reload on next login.
              </p>
            </div>
          </div>
          <Button
            data-ocid="admin.sample_data.primary_button"
            onClick={handleReseed}
            disabled={isSeeding}
            variant="outline"
            className="w-full font-semibold border"
            style={{
              borderColor: "var(--color-amber)",
              color: "var(--color-amber)",
            }}
          >
            {isSeeding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Re-seed Sample Orders
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Admin Page ───────────────────────────────────────────────────────
export default function AdminPage() {
  return (
    <div className="p-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--color-green-dim)" }}
          >
            <ShieldCheck
              className="w-5 h-5"
              style={{ color: "var(--color-green)" }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Admin Panel
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage orders, delivery boys, and system settings
            </p>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="mb-6 bg-card border border-border">
          <TabsTrigger
            data-ocid="admin.orders.tab"
            value="orders"
            className="flex items-center gap-1.5 data-[state=active]:text-foreground"
          >
            <Package className="w-4 h-4" /> Orders
          </TabsTrigger>
          <TabsTrigger
            data-ocid="admin.create_order.tab"
            value="create"
            className="flex items-center gap-1.5 data-[state=active]:text-foreground"
          >
            <Truck className="w-4 h-4" /> Create Order
          </TabsTrigger>
          <TabsTrigger
            data-ocid="admin.delivery_boys.tab"
            value="delivery-boys"
            className="flex items-center gap-1.5 data-[state=active]:text-foreground"
          >
            <Users className="w-4 h-4" /> Delivery Boys
          </TabsTrigger>
          <TabsTrigger
            data-ocid="admin.sample_data.tab"
            value="sample-data"
            className="flex items-center gap-1.5 data-[state=active]:text-foreground"
          >
            <RefreshCw className="w-4 h-4" /> Sample Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <AdminOrdersTab />
        </TabsContent>
        <TabsContent value="create">
          <CreateOrderTab />
        </TabsContent>
        <TabsContent value="delivery-boys">
          <DeliveryBoysTab />
        </TabsContent>
        <TabsContent value="sample-data">
          <SampleDataTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
