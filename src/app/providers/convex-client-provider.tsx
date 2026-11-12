"use client";

import { ReactNode, useMemo } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const client = useMemo(() => {
    if (!convexUrl) return null;
    return new ConvexReactClient(convexUrl);
  }, []);

  // Gracefully pass through children if NEXT_PUBLIC_CONVEX_URL is not yet set,
  // ensuring existing Neon/Prisma pages work undisturbed until Convex is activated.
  if (!client) {
    return <>{children}</>;
  }

  return (
    <ConvexProviderWithClerk client={client} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
