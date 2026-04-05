import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Phone,
  Ruler,
  Truck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { OrderInternal } from "../backend";
import { OrderStatus } from "../backend";
import { useActor } from "../hooks/useActor";

interface Props {
  order: OrderInternal;
  onOrderAction?: () => void;
  index: number;
}

export default function OrderCard({ order, onOrderAction, index }: Props) {
  const { actor } = useActor();
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [completing, setCompleting] = useState(false);

  const handleAccept = async () => {
    if (!actor) return;
    setAccepting(true);
    try {
      await actor.acceptOrder(order.id);
      toast.success(`Order #${order.id} accepted!`);
      onOrderAction?.();
    } catch {
      toast.error("Failed to accept order");
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = async () => {
    if (!actor) return;
    setRejecting(true);
    try {
      await actor.rejectOrder(order.id);
      toast.success(`Order #${order.id} rejected`);
      onOrderAction?.();
    } catch {
      toast.error("Failed to reject order");
    } finally {
      setRejecting(false);
    }
  };

  const handleComplete = async () => {
    if (!actor) return;
    setCompleting(true);
    try {
      await actor.completeOrder(order.id);
      toast.success(`Order #${order.id} marked as delivered!`);
      onOrderAction?.();
    } catch {
      toast.error("Failed to complete order");
    } finally {
      setCompleting(false);
    }
  };

  const statusColors: Record<OrderStatus, string> = {
    [OrderStatus.new_]: "var(--color-green)",
    [OrderStatus.ongoing]: "var(--color-amber)",
    [OrderStatus.completed]: "oklch(0.55 0.18 260)",
    [OrderStatus.rejected]: "var(--color-danger)",
  };

  const statusLabels: Record<OrderStatus, string> = {
    [OrderStatus.new_]: "New Order",
    [OrderStatus.ongoing]: "In Transit",
    [OrderStatus.completed]: "Delivered",
    [OrderStatus.rejected]: "Rejected",
  };

  return (
    <div
      data-ocid={`order.item.${index}`}
      className="rounded-2xl p-4 transition-shadow hover:shadow-card"
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-card-border)",
      }}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            Order #{order.id.toString()}
          </span>
          <span className="text-xs text-muted-foreground">
            {order.customerName}
          </span>
        </div>
        <Badge
          className="text-xs px-2 py-0.5 font-medium border-0"
          style={{
            background: `${statusColors[order.status]}20`,
            color: statusColors[order.status],
          }}
        >
          {statusLabels[order.status]}
        </Badge>
      </div>

      {/* Addresses */}
      <div className="space-y-2 mb-3">
        <div className="flex items-start gap-2">
          <div
            className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
            style={{ background: "var(--color-danger)" }}
          />
          <div>
            <p className="text-xs text-muted-foreground">Pickup</p>
            <p className="text-sm text-foreground">{order.pickupAddress}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div
            className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
            style={{ background: "var(--color-green)" }}
          />
          <div>
            <p className="text-xs text-muted-foreground">Dropoff</p>
            <p className="text-sm text-foreground">{order.dropoffAddress}</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div
        className="flex items-center gap-4 py-2.5 px-3 rounded-xl mb-3"
        style={{ background: "oklch(var(--muted))" }}
      >
        <div className="flex items-center gap-1.5">
          <Ruler className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {order.distanceKm.toFixed(1)} km
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {Math.round(order.distanceKm * 3 + 10)} min
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">
            ₹{order.deliveryFee.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {order.status === OrderStatus.new_ && (
          <>
            <Button
              data-ocid={`order.accept_button.${index}`}
              size="sm"
              onClick={handleAccept}
              disabled={accepting || rejecting}
              className="flex-1 h-8 text-xs font-semibold border-0"
              style={{ background: "var(--color-green)", color: "#0F1115" }}
            >
              {accepting ? (
                <>
                  <Truck className="mr-1.5 h-3.5 w-3.5" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                  Accept
                </>
              )}
            </Button>
            <Button
              data-ocid={`order.reject_button.${index}`}
              size="sm"
              variant="outline"
              onClick={handleReject}
              disabled={accepting || rejecting}
              className="flex-1 h-8 text-xs font-semibold"
              style={{ borderColor: "var(--color-card-border)" }}
            >
              {rejecting ? (
                <>Rejecting...</>
              ) : (
                <>
                  <XCircle className="mr-1.5 h-3.5 w-3.5" />
                  Reject
                </>
              )}
            </Button>
          </>
        )}

        {order.status === OrderStatus.ongoing && (
          <>
            <Button
              data-ocid={`order.complete_button.${index}`}
              size="sm"
              onClick={handleComplete}
              disabled={completing}
              className="flex-1 h-8 text-xs font-semibold border-0"
              style={{ background: "var(--color-green)", color: "#0F1115" }}
            >
              {completing ? (
                <>Completing...</>
              ) : (
                <>
                  <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                  Mark Delivered
                </>
              )}
            </Button>
            {order.customerPhone && (
              <a
                href={`tel:${order.customerPhone}`}
                data-ocid={`order.call_button.${index}`}
                className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium transition-colors hover:bg-accent"
                style={{
                  background: "oklch(var(--muted))",
                  color: "var(--color-green)",
                }}
              >
                <Phone className="w-3.5 h-3.5" />
                Call
              </a>
            )}
          </>
        )}

        {order.status === OrderStatus.completed && (
          <div className="flex items-center gap-2">
            <MapPin
              className="w-3.5 h-3.5"
              style={{ color: "var(--color-green)" }}
            />
            <span className="text-xs" style={{ color: "var(--color-green)" }}>
              Delivered Successfully
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
