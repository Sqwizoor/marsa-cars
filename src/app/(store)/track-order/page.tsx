import TrackOrderClient from "@/components/store/track-order/track-order-client";
import { lookupOrderOrTracking } from "@/queries/tracking";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Order | Bob Go Live Courier Tracking",
  description:
    "Track your car parts and accessories order in real time with Bob Go courier tracking.",
};

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; ref?: string; orderId?: string }>;
}) {
  const resolved = searchParams ? await searchParams : {};
  const initialQuery = (
    resolved.q ||
    resolved.ref ||
    resolved.orderId ||
    ""
  ).trim();

  const initialResults = initialQuery
    ? await lookupOrderOrTracking(initialQuery)
    : [];

  return (
    <TrackOrderClient
      initialQuery={initialQuery}
      initialResults={initialResults}
    />
  );
}
