import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { UserProfile } from "./backend";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";

type AppState = "loading" | "not-authenticated" | "no-profile" | "dashboard";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [appState, setAppState] = useState<AppState>("loading");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isInitializing) {
      setAppState("loading");
      return;
    }

    if (!identity || identity.getPrincipal().isAnonymous()) {
      setAppState("not-authenticated");
      return;
    }

    if (!actor || isFetching) {
      setAppState("loading");
      return;
    }

    setCheckingProfile(true);
    Promise.all([actor.getCallerUserProfile(), actor.isCallerAdmin()])
      .then(([profile, adminStatus]) => {
        setIsAdmin(adminStatus);
        if (profile === null) {
          setAppState("no-profile");
        } else {
          setUserProfile(profile);
          setAppState("dashboard");
          // Seed sample orders once
          const seeded = localStorage.getItem("sampleOrdersSeeded");
          if (!seeded) {
            actor.createSampleOrders().then(() => {
              localStorage.setItem("sampleOrdersSeeded", "true");
            });
          }
        }
      })
      .catch(() => {
        setAppState("not-authenticated");
      })
      .finally(() => {
        setCheckingProfile(false);
      });
  }, [identity, actor, isFetching, isInitializing]);

  const handleProfileSaved = (profile: UserProfile) => {
    setUserProfile(profile);
    setAppState("dashboard");
    // Seed sample orders after new profile setup
    const seeded = localStorage.getItem("sampleOrdersSeeded");
    if (!seeded && actor) {
      actor.createSampleOrders().then(() => {
        localStorage.setItem("sampleOrdersSeeded", "true");
      });
    }
  };

  if (appState === "loading" || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-green-dim)] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground text-sm">
            Loading Delivery Boy App...
          </p>
        </div>
      </div>
    );
  }

  if (appState === "not-authenticated") {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  if (appState === "no-profile") {
    return (
      <>
        <ProfileSetupPage onProfileSaved={handleProfileSaved} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <DashboardLayout
        userProfile={userProfile!}
        onProfileUpdate={setUserProfile}
        isAdmin={isAdmin}
      />
      <Toaster />
    </>
  );
}
