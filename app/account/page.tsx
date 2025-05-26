"use client";
import { useEffect, useState, useCallback } from "react";
import { useSupabaseAuth } from "@/providers/SupabaseAuthProvider";
import InitialMedicalInfoForm from "@/components/InitialMedicalInfoForm";
import DashboardPanel from "@/components/DashboardPanel";
import { useRouter, usePathname } from "next/navigation"; // Import usePathname

export default function AccountPage() {
  const { user, supabase, session } = useSupabaseAuth();
  const router = useRouter();
  const pathname = usePathname();
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
        if (pathname !== "/login") {
          // Use pathname here
          router.replace("/login"); // Use replace to avoid adding to history
        }
        return; // Exit early
      }

      // If user exists and auth check is not yet complete for this render cycle
      if (user && !isAuthCheckComplete) {
        // Fetch profile data from the 'profiles' table
        const fetchProfileStatus = async () => {
          const { data, error } = await supabase
            .from("profiles")
            .select(
              "has_initial_medical_info, weight, height, date_of_birth, gender"
            )
            .eq("id", user.id)
            .single();

          if (error && error.code !== "PGRST116") {
            // PGRST116 means no rows found (new user)
            console.error(
              "Error fetching user profile status:",
              JSON.stringify(error, null, 2)
            );
            // Default to false if there's an error, forcing user to complete form
            setHasBasicMedicalInfo(false);
          } else if (data) {
            // Check if essential fields are present in the profile data
            const hasRequiredBasicInfo =
              !!data.weight &&
              !!data.height &&
              !!data.date_of_birth &&
              !!data.gender;
            setHasBasicMedicalInfo(
              !!data.has_initial_medical_info || hasRequiredBasicInfo
            );
          } else {
            // If no profile found, assume medical info is not complete
            setHasBasicMedicalInfo(false);
          }
          setIsAuthCheckComplete(true); // Mark check as complete after attempting to fetch
        };

        fetchProfileStatus();
      }
    }
  }, [user, session, pathname, router, isAuthCheckComplete, supabase]); // Add supabase to dependencies

  // Display loading indicator while authentication status and profile data are being determined
  if (!isAuthCheckComplete || hasBasicMedicalInfo === undefined) {
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
