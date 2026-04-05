import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import LeafletMap from "../components/LeafletMap";
import { useActor } from "../hooks/useActor";

// Tirupati delivery locations
const TIRUPATI_MARKERS = [
  {
    lat: 13.6288,
    lng: 79.4192,
    color: "#ef4444",
    label: "Tirupati Railway Station - Pickup Zone",
  },
  {
    lat: 13.6507,
    lng: 79.4132,
    color: "#2ECC71",
    label: "Alipiri - Delivery",
  },
  {
    lat: 13.6833,
    lng: 79.3478,
    color: "#2ECC71",
    label: "Tirumala - Delivery",
  },
  {
    lat: 13.6105,
    lng: 79.4023,
    color: "#2ECC71",
    label: "Renigunta - Delivery",
  },
  {
    lat: 13.634,
    lng: 79.415,
    color: "#f59e0b",
    label: "Balaji Colony - In Transit",
  },
  {
    lat: 13.662,
    lng: 79.425,
    color: "#f59e0b",
    label: "Srinivasa Nagar - In Transit",
  },
];

// Tirupati main delivery route
const TIRUPATI_ROUTE: [number, number][] = [
  [13.6288, 79.4192], // Railway Station
  [13.634, 79.415], // Balaji Colony
  [13.6507, 79.4132], // Alipiri
  [13.662, 79.425], // Srinivasa Nagar
  [13.6833, 79.3478], // Tirumala
];

export default function MapViewPage() {
  const { actor } = useActor();
  const [updatingLocation, setUpdatingLocation] = useState(false);

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setUpdatingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          if (actor) {
            await actor.updateDeliveryBoyLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            toast.success("Location updated successfully");
          }
        } catch {
          toast.error("Failed to update location");
        } finally {
          setUpdatingLocation(false);
        }
      },
      () => {
        toast.error("Unable to get your location");
        setUpdatingLocation(false);
      },
    );
  };

  return (
    <div className="p-5 h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Map View
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tirupati lo live delivery tracking
          </p>
        </div>
        <Button
          data-ocid="map.update_location.button"
          onClick={handleUpdateLocation}
          disabled={updatingLocation}
          size="sm"
          className="flex items-center gap-2 font-semibold border-0"
          style={{ background: "var(--color-green)", color: "#0F1115" }}
        >
          <Navigation className="w-4 h-4" />
          {updatingLocation ? "Updating..." : "Update My Location"}
        </Button>
      </motion.div>

      {/* Route Info Banner */}
      <div
        className="rounded-xl px-4 py-3 mb-4 flex items-center gap-3"
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-card-border)",
        }}
      >
        <MapPin
          className="w-4 h-4 flex-shrink-0"
          style={{ color: "var(--color-green)" }}
        />
        <div className="text-sm">
          <span className="font-semibold text-foreground">
            Tirupati Delivery Zone
          </span>
          <span className="text-muted-foreground ml-2">
            Railway Station → Alipiri → Tirumala Route
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        {[
          { color: "#ef4444", label: "Pickup Points" },
          { color: "#2ECC71", label: "Drop-off Points" },
          { color: "#f59e0b", label: "In Transit" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" style={{ color }} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Map */}
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 rounded-2xl overflow-hidden"
        style={{
          border: "1px solid var(--color-card-border)",
          minHeight: "500px",
        }}
      >
        <LeafletMap
          center={[13.6507, 79.4]}
          zoom={13}
          markers={TIRUPATI_MARKERS}
          routePoints={TIRUPATI_ROUTE}
          className="h-full w-full"
          style={{ minHeight: "500px" }}
        />
      </motion.div>
    </div>
  );
}
