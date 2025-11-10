import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserCountry } from "./lib/get-user-country";

const isProtectedRoute = createRouteMatcher([
  "/dashboard",
  "/dashboard(.*)",
  "/forum(.*)",
  "/checkout",
  "/profile",
  "/profile/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const response = NextResponse.next();
  if (isProtectedRoute(req)) await auth.protect();

  /*---------Handle Country detection----------*/
  // Step 1: Check if country is already set in cookies
  const countryCookie = req.cookies.get("userCountry");

  if (!countryCookie) {
    // Step 2: Get the user country using the helper function
    const userCountry = await getUserCountry();

    // Step 3: Set a cookie with the detected or default country for future requests
    response.cookies.set("userCountry", JSON.stringify(userCountry), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
