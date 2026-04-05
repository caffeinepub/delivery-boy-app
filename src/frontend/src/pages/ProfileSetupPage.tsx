import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2, Package, Phone, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend";
import { useActor } from "../hooks/useActor";

interface Props {
  onProfileSaved: (profile: UserProfile) => void;
}

export default function ProfileSetupPage({ onProfileSaved }: Props) {
  const { actor } = useActor();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const validate = () => {
    const errs: { name?: string; phone?: string } = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!phone.trim()) errs.phone = "Phone number is required";
    else if (!/^[0-9+\-\s]{7,15}$/.test(phone.trim()))
      errs.phone = "Enter a valid phone number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !actor) return;

    setSaving(true);
    try {
      const profile: UserProfile = {
        name: name.trim(),
        phoneNumber: phone.trim(),
        isOnline: true,
        location: { latitude: 17.385, longitude: 78.487 },
      };
      await actor.saveCallerUserProfile(profile);
      toast.success("Profile saved! Welcome to Delivery Boy App");
      onProfileSaved(profile);
    } catch {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 w-96 h-96 rounded-full opacity-5"
          style={{ background: "var(--color-green)", filter: "blur(120px)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: "var(--color-green-dim)",
              border: "1px solid var(--color-green)",
            }}
          >
            <Package
              className="w-8 h-8"
              style={{ color: "var(--color-green)" }}
            />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Set Up Your Profile
          </h1>
          <p className="text-muted-foreground text-sm">
            Complete your delivery boy profile to get started
          </p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{
            background: "var(--color-card)",
            border: "1px solid var(--color-card-border)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <User
                  className="w-4 h-4"
                  style={{ color: "var(--color-green)" }}
                />
                Full Name
              </Label>
              <Input
                id="name"
                data-ocid="profile.name.input"
                placeholder="e.g. Ravi Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-input border-border h-11"
              />
              {errors.name && (
                <p
                  data-ocid="profile.name.error_state"
                  className="text-xs"
                  style={{ color: "var(--color-danger)" }}
                >
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <Phone
                  className="w-4 h-4"
                  style={{ color: "var(--color-green)" }}
                />
                Phone Number
              </Label>
              <Input
                id="phone"
                data-ocid="profile.phone.input"
                placeholder="e.g. +91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-input border-border h-11"
              />
              {errors.phone && (
                <p
                  data-ocid="profile.phone.error_state"
                  className="text-xs"
                  style={{ color: "var(--color-danger)" }}
                >
                  {errors.phone}
                </p>
              )}
            </div>

            <Button
              type="submit"
              data-ocid="profile.submit_button"
              disabled={saving}
              className="w-full h-11 font-semibold"
              style={{
                background: "var(--color-green)",
                color: "#0F1115",
                border: "none",
              }}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Setup
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
