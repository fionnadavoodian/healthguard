"use client";
import { useEffect, useState, useCallback } from "react";
import { useSupabaseAuth } from "@/providers/SupabaseAuthProvider";
import InitialMedicalInfoForm from "@/components/InitialMedicalInfoForm";
import DashboardPanel from "@/components/DashboardPanel";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const { user, supabase, session } = useSupabaseAuth();
  const router = useRouter();

  // State to track if the initial user/session check is complete
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
  // State to determine if the user has completed basic medical info
  const [hasBasicMedicalInfo, setHasBasicMedicalInfo] = useState<
    boolean | undefined
  >(undefined);

  // Callback for when initial medical info is saved
  const handleMedicalInfoSaved = useCallback(() => {
    setHasBasicMedicalInfo(true);
    // SupabaseAuthProvider's onAuthStateChange already calls router.refresh()
    // after user updates, so we can likely remove this direct call here
    // router.refresh();
  }, []); // No dependency on router here as we explicitly rely on auth listener refresh

  useEffect(() => {
    // Only proceed if user and session are definitively loaded (not undefined)
    if (user !== undefined && session !== undefined) {
      // If no user after the auth check, redirect to login page
      if (!user) {
        // Only redirect if not already on the login page to prevent loop
        if (router.pathname !== "/login") {
          // Check current path if available (router.pathname is client-side)
          router.replace("/login"); // Use replace to avoid adding to history
        }
        return; // Exit early
      }

      // If user exists and auth check is not yet complete for this render cycle
      if (user && !isAuthCheckComplete) {
        const userMetadata = user.user_metadata;
        const hasRequiredBasicInfo =
          !!userMetadata?.weight &&
          !!userMetadata?.height &&
          !!userMetadata?.date_of_birth &&
          !!userMetadata?.gender;
        setHasBasicMedicalInfo(
          !!userMetadata?.has_initial_medical_info || hasRequiredBasicInfo
        );
        setIsAuthCheckComplete(true); // Mark check as complete
      }
    }
  }, [user, session, router, isAuthCheckComplete]); // Dependencies for this effect

  // Display loading indicator while authentication status is being determined
  if (!isAuthCheckComplete) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-var(--navbar-height))]">
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Authenticating and loading health data...
        </p>
      </div>
    );
  }

  // If auth check is complete but no user (meaning redirect initiated above)
  if (!user) {
    return null; // Don't render anything if user is not authenticated and redirect has been triggered
  }

  // Render either initial form or dashboard based on medical info completion
  if (!hasBasicMedicalInfo) {
    return (
      <InitialMedicalInfoForm
        user={user}
        supabase={supabase}
        onInfoSaved={handleMedicalInfoSaved}
      />
    );
  } else {
    return <DashboardPanel user={user} />;
  }
}
