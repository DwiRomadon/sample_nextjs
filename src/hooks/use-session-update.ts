import { useSession } from "next-auth/react";

interface UpdateSessionOptions {
  name?: string;
  email?: string;
  role?: string;
}

export function useSessionUpdate() {
  const { update, data: session } = useSession();

  const updateSession = async (
    updates: UpdateSessionOptions
  ): Promise<boolean> => {
    // Pastikan session dan user ada
    if (!session || !session.user) {
      console.warn("No active session found");
      return false;
    }

    try {
      // Gunakan update function dari useSession
      await update({
        ...session,
        user: {
          ...session.user,
          ...updates,
        },
      });
      return true;
    } catch (error) {
      console.error("Failed to update session:", error);
      return false;
    }
  };

  return { updateSession };
}
