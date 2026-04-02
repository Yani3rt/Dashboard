import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import "next-auth/jwt";

type RefreshTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      authorization: { params: { access_type: "offline", prompt: "consent" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.access_token = account.access_token ?? "";
        token.expires_at = account.expires_at ?? 0;
        token.refresh_token = account.refresh_token;
        return token;
      }

      if (Date.now() < token.expires_at * 1000) {
        return token;
      }

      if (!token.refresh_token) {
        throw new TypeError("Missing refresh_token");
      }

      try {
        const response = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          body: new URLSearchParams({
            client_id: process.env.AUTH_GOOGLE_ID!,
            client_secret: process.env.AUTH_GOOGLE_SECRET!,
            grant_type: "refresh_token",
            refresh_token: token.refresh_token,
          }),
        });

        const tokensOrError: RefreshTokenResponse | { error: string } = await response.json();

        if (!response.ok) {
          throw tokensOrError;
        }

        token.access_token = tokensOrError.access_token;
        token.expires_at = Math.floor(Date.now() / 1000 + tokensOrError.expires_in);
        token.refresh_token = tokensOrError.refresh_token ?? token.refresh_token;

        return token;
      } catch (error) {
        console.error("Error refreshing access_token", error);
        token.error = "RefreshTokenError";
        return token;
      }
    },
    async session({ session, token }) {
      session.error = token.error;
      return session;
    },
  },
});

declare module "next-auth" {
  interface Session {
    error?: "RefreshTokenError";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token: string;
    expires_at: number;
    refresh_token?: string;
    error?: "RefreshTokenError";
  }
}
