"use client";

import { OfferTag } from "@prisma/client";
import OfferTagsLinks from "../categories-header/offerTags-links";

export default function OfferTagsWrapper({
  offerTags,
}: {
  offerTags: OfferTag[];
}) {
  return <OfferTagsLinks offerTags={offerTags} open={false} />;
}
