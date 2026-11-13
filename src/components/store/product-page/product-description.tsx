"use client";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";

const basicSanitize = (html: string) =>
  html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/javascript:/gi, "");

export default function ProductDescription({
  text,
}: {
  text: string;
}) {
  const [sanitizedDescription, setSanitizedDescription] = useState<string>(() =>
    basicSanitize(text)
  );

  useEffect(() => {
    if (typeof DOMPurify?.sanitize === "function") {
      setSanitizedDescription(DOMPurify.sanitize(text));
    } else {
      setSanitizedDescription(basicSanitize(text));
    }
  }, [text]);

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
