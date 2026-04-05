import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Package, Shield, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full opacity-5"
          style={{ background: "var(--color-green)", filter: "blur(120px)" }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-5"
          style={{ background: "oklch(0.60 0.22 25)", filter: "blur(100px)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 overflow-hidden"
          >
            <img
              src="/assets/whatsapp_image_2026-03-30_at_10.28.02_pm-019d5c35-841b-7749-aa1d-dc2a98a15173.jpeg"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Delivery Boy App
          </h1>
          <p className="text-muted-foreground text-sm">
            Your smart delivery management dashboard
          </p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="rounded-2xl p-8 mb-6"
          style={{
            background: "var(--color-card)",
            border: "1px solid var(--color-card-border)",
          }}
        >
          <h2 className="text-xl font-display font-semibold text-foreground mb-2">
            Welcome Back
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Login with your Internet Identity to access your delivery dashboard
          </p>

          <Button
            data-ocid="login.primary_button"
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-11 font-semibold text-sm"
            style={{
              background: "var(--color-green)",
              color: "#0F1115",
              border: "none",
            }}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Login with Internet Identity
              </>
            )}
          </Button>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { icon: Package, label: "Order Management" },
            { icon: MapPin, label: "Live Tracking" },
            { icon: TrendingUp, label: "Earnings" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="rounded-xl p-4 text-center"
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-card-border)",
              }}
            >
              <Icon
                className="w-5 h-5 mx-auto mb-2"
                style={{ color: "var(--color-green)" }}
              />
              <p className="text-xs text-muted-foreground font-medium">
                {label}
              </p>
            </div>
          ))}
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Secure authentication powered by Internet Computer
        </p>
      </motion.div>
    </div>
  );
}
