import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

// Minimal Convex Auth setup
export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password],
});
