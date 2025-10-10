import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect } from "react";

/**
 * Custom hook to log Clerk authentication tokens
 * This will log the token whenever the user is authenticated
 */
export function useAuthTokenLogger() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const logAuthToken = async () => {
      if (userLoaded && user) {
        try {
          const token = await getToken();
          if (token) {
            console.log("ClerkAuth (http, Bearer):", token);
            console.log("Token length:", token.length);
            console.log("Token type:", typeof token);
            console.log("User ID:", user.id);
          } else {
            console.warn("No authentication token available");
          }
        } catch (error) {
          console.error("Error getting auth token:", error);
        }
      }
    };
    
    logAuthToken();
  }, [userLoaded, user, getToken]);
}

/**
 * Function to manually log auth token
 * This should be called from within a React component that has access to Clerk hooks
 */
export function createAuthTokenLogger(getToken: () => Promise<string | null>, user: any) {
  return async () => {
    try {
      const token = await getToken();
      if (token) {
        console.log("ClerkAuth (http, Bearer):", token);
        console.log("Token length:", token.length);
        console.log("Token type:", typeof token);
        console.log("User ID:", user?.id);
        return token;
      } else {
        console.warn("No authentication token available");
        return null;
      }
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  };
}
