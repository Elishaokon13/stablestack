/**
 * Clerk Configuration
 * Centralized Clerk token and session settings
 */

export const CLERK_TOKEN_OPTIONS = {
  // Leeway time in seconds for token validation
  // This allows tokens to be valid for up to this many seconds
  leewayInSeconds: 1800, // 30 minutes

  // Skip cache to always get fresh token (set to false for better performance)
  skipCache: false,
};

/**
 * Get token with custom options
 * Use this in hooks that need extended token lifetime
 */
export async function getTokenWithOptions(
  getToken: () => Promise<string | null>
): Promise<string | null> {
  return await getToken(CLERK_TOKEN_OPTIONS);
}
