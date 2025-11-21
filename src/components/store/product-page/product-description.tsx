"use client";
import DOMPurify from "dompurify";

export default function ProductDescription({
  text,
}: {
  text: string;
}) {
  const sanitizedDescription = DOMPurify.sanitize(text);
  return (
    <div className="pt-6">
      {/* Title */}
      <div className="h-12">
        <h2 className="text-secondary-charcoal text-2xl font-bold">Description</h2>
      </div>
      {/* Display product description */}
      <div 
        className="prose prose-sm sm:prose-base max-w-none [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg text-secondary-darkGrey" 
        dangerouslySetInnerHTML={{ __html: sanitizedDescription }} 
      />
    </div>
  );
}
