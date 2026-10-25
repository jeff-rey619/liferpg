import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/server/db";
import { users, profiles, workspaces, workspaceMembers } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        if (!email) return null;
        let [user] = await db.select().from(users).where(eq(users.email, email));
        if (!user) {
          [user] = await db
            .insert(users)
            .values({ email, name: email.split("@")[0] })
            .returning();
          await db.insert(profiles).values({
            userId: user.id,
            displayName: user.name ?? email,
            timezone: "UTC",
          });
          const [workspace] = await db
            .insert(workspaces)
            .values({ ownerId: user.id })
            .returning();
          await db.insert(workspaceMembers).values({
            workspaceId: workspace.id,
            userId: user.id,
            role: "owner",
          });
        }
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.userId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.userId) session.user.id = String(token.userId);
      return session;
    },
  },
});