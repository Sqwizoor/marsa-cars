"use client";
import DOMPurify from "dompurify";

export default function ProductDescription({
  text,
}: {
  text: [string, string];
}) {
  const sanitizedDescription1 = DOMPurify.sanitize(text[0]);
  const sanitizedDescription2 = DOMPurify.sanitize(text[1]);
  return (
    <div className="pt-6">
      {/* Title */}
      <div className="h-12">
        <h2 className="text-main-primary text-2xl font-bold">Description</h2>
      </div>
      {/* Display both descriptions */}
      <div className="prose prose-sm sm:prose-base max-w-none [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg" dangerouslySetInnerHTML={{ __html: sanitizedDescription1 }} />
      <div className="prose prose-sm sm:prose-base max-w-none [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg mt-4" dangerouslySetInnerHTML={{ __html: sanitizedDescription2 }} />
    </div>
  );
}
