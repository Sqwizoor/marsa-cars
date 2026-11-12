export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN || process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL || "https://clerk.joumasecars.africa",
      applicationID: "convex",
    },
  ],
};
