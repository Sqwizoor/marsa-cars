"use client";
import { Dot, Info, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Instructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn(
      "bg-teal-100 border-t-4 border-teal-500 text-teal-900 shadow-md transition-all duration-300",
      "lg:h-[calc(100vh-64px)] lg:overflow-y-auto"
    )}>
      {/* Mobile Toggle Header */}
      <div 
        className="flex items-center justify-between p-4 lg:cursor-default cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Info className="stroke-teal-500 w-5 h-5" />
          <p className="font-bold">Instructions</p>
        </div>
        <div className="lg:hidden">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {/* Content */}
      <div className={cn(
        "px-4 pb-4 overflow-hidden transition-all duration-300",
        isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 lg:max-h-full lg:opacity-100 p-0 lg:p-4 lg:pt-0"
      )}>
        <div>
          {instructions.map((inst, index) => (
            <div key={index} className="flex gap-x-1 mt-1">
              <Dot className="w-4 flex-shrink-0" />
              <p className="text-sm">{inst.info}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const instructions = [
  {
    info: "Start by selecting the seller subscription package that best suits your goals—this unlocks the right limits for your store.",
  },
  {
    info: 'Use your real photo as the profile picture. To update, click on the image, then select "Manage Account."',
  },
  {
    info: "Make sure your first and last name are your real names to ensure they get approved.",
  },
  {
    info: "Ensure your email address is correct. This is how we will contact you for important updates.",
  },
  {
    info: "Provide a valid phone number so customers can reach you if necessary.",
  },
  {
    info: "Set up your store logo and cover photo to make your store more attractive to customers.",
  },
  {
    info: "Specify default shipping details like service, fees, and delivery time to streamline orders.",
  },
  {
    info: "Include a clear return policy to build trust and avoid disputes.",
  },
  {
    info: "Double-check your store's URL to ensure it's working and easy for customers to find.",
  },
  {
    info: "Enter a detailed store description that highlights your offerings and what sets your store apart.",
  },
  {
    info: "Fill in the default shipping fee fields carefully to avoid discrepancies during order processing.",
  },
  {
    info: "Provide a realistic delivery time range to set clear expectations for your customers.",
  },
  {
    info: "Review all details before submitting to ensure everything is accurate and complete for approval.",
  },
];
