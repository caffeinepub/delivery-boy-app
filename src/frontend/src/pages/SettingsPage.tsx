import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  CheckCircle,
  Copy,
  Loader2,
  Phone,
  User,
  Wifi,
  WifiOff,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface Props {
  userProfile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
}

export default function SettingsPage({ userProfile, onProfileUpdate }: Props) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [name, setName] = useState(userProfile.name);
  const [phone, setPhone] = useState(userProfile.phoneNumber);
  const [isOnline, setIsOnline] = useState(userProfile.isOnline);
  const [saving, setSaving] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [copied, setCopied] = useState(false);

  const principal = identity?.getPrincipal().toString() ?? "Not connected";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    setSaving(true);
    try {
      const updated: UserProfile = {
        ...userProfile,
        name: name.trim(),
        phoneNumber: phone.trim(),
      };
      await actor.saveCallerUserProfile(updated);
      onProfileUpdate(updated);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleOnline = async (value: boolean) => {
    if (!actor) return;
    setTogglingStatus(true);
    try {
      await actor.setDeliveryBoyOnlineStatus(value);
      setIsOnline(value);
      onProfileUpdate({ ...userProfile, isOnline: value });
      toast.success(value ? "You are now online" : "You are now offline");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleCopyPrincipal = () => {
    navigator.clipboard.writeText(principal).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="p-5 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-display font-bold text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your profile and preferences
        </p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl p-6 mb-5"
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-card-border)",
        }}
      >
        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <User className="w-4 h-4" style={{ color: "var(--color-green)" }} />
          Profile Information
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="settings-name"
              className="text-sm font-medium text-foreground flex items-center gap-2"
            >
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              Full Name
            </Label>
            <Input
              id="settings-name"
              data-ocid="settings.name.input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-input border-border h-10"
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="settings-phone"
              className="text-sm font-medium text-foreground flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              Phone Number
            </Label>
            <Input
              id="settings-phone"
              data-ocid="settings.phone.input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-input border-border h-10"
              placeholder="+91 XXXXX XXXXX"
            />
          </div>

          <Button
            type="submit"
            data-ocid="settings.save.submit_button"
            disabled={saving}
            className="font-semibold border-0"
            style={{ background: "var(--color-green)", color: "#0F1115" }}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </motion.div>

      {/* Online Status Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-6 mb-5"
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-card-border)",
        }}
      >
        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-4 h-4" style={{ color: "var(--color-green)" }} />
          ) : (
            <WifiOff className="w-4 h-4 text-muted-foreground" />
          )}
          Delivery Status
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground font-medium">
              {isOnline ? "Currently Online" : "Currently Offline"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isOnline
                ? "You are available to receive new orders"
                : "You won't receive new order assignments"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isOnline && (
              <span
                className="w-2 h-2 rounded-full animate-pulse-green"
                style={{ background: "var(--color-green)" }}
              />
            )}
            <Switch
              data-ocid="settings.online_status.switch"
              checked={isOnline}
              onCheckedChange={handleToggleOnline}
              disabled={togglingStatus}
              style={isOnline ? { backgroundColor: "var(--color-green)" } : {}}
            />
          </div>
        </div>
      </motion.div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl p-6"
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-card-border)",
        }}
      >
        <h2 className="text-base font-semibold text-foreground mb-4">
          Account Information
        </h2>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Principal ID</p>
            <div className="flex items-center gap-2">
              <code
                className="text-xs font-mono text-muted-foreground px-3 py-2 rounded-lg flex-1 truncate"
                style={{ background: "oklch(var(--muted))" }}
              >
                {principal}
              </code>
              <Button
                data-ocid="settings.copy_principal.button"
                size="sm"
                variant="outline"
                onClick={handleCopyPrincipal}
                className="flex-shrink-0"
              >
                {copied ? (
                  <CheckCircle
                    className="h-3.5 w-3.5"
                    style={{ color: "var(--color-green)" }}
                  />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          <Separator className="border-border" />

          <div>
            <p className="text-xs text-muted-foreground mb-1">App Version</p>
            <p className="text-sm text-foreground">Delivery Boy App v1.0.0</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
