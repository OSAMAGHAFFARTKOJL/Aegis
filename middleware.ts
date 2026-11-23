import { withAuth } from "next-auth/middleware";

// Protect the app. Unauthenticated users are redirected to /login.
export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: ["/app/:path*"],
};
