
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitPartRequest } from "@/actions/part-request";
import { toast } from "react-hot-toast";
import { Loader2, Search } from "lucide-react";

export default function SourcePartModal() {
  const pathname = usePathname();
  // Only show on the home page. Do not show on cart, checkout, or any other non-home page.
  const isHomePage = pathname === "/";

  const [open, setOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form state
  const [partName, setPartName] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [vehicleDetails, setVehicleDetails] = useState("");
  const [userName, setUserName] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  const resetForm = () => {
    setPartName("");
    setPartNumber("");
    setVehicleDetails("");
    setUserName("");
    setContactInfo("");
    setIsSuccess(false);
  };

  useEffect(() => {
    if (!isHomePage) {
      setOpen(false);
      return;
    }

    // Check if we've already shown it this session to avoid spamming on reload
    const sessionShown = sessionStorage.getItem("partRequestShown");
    if (sessionShown) {
      setHasShown(true);
    }

    const timer = setTimeout(() => {
      // Show after 1 minute only on the home page
      if (!sessionStorage.getItem("partRequestSubmitted")) {
        setOpen(true);
        setHasShown(true);
        sessionStorage.setItem("partRequestShown", "true");
      }
    }, 60000); // 1 minute

    return () => {
      clearTimeout(timer);
    };
  }, [isHomePage]);

  if (!isHomePage) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await submitPartRequest({
        partName,
        partNumber: partNumber || undefined,
        vehicleDetails,
        userName,
        contactInfo,
      });

      if (result.success) {
        setIsSuccess(true);
        toast.success("Request submitted successfully!");
        sessionStorage.setItem("partRequestSubmitted", "true");
        // Close after 2 seconds
        setTimeout(() => {
            setOpen(false);
            resetForm();
        }, 2000);
      } else {
        toast.error(result.error || "Something went wrong.");
      }
    } catch (error) {
      toast.error("Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-[425px] md:max-w-[600px] max-h-[90dvh] overflow-y-auto p-0 border-0 shadow-2xl rounded-2xl z-[9999] [&>button]:text-white [&>button]:opacity-90 [&>button]:hover:opacity-100">
        <div className="relative min-h-[7rem] py-5 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center overflow-hidden">
            {/* Background Pattern */}
             <div className="absolute inset-0 opacity-20" 
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}>
             </div>
             
             <div className="relative z-10 flex flex-col items-center text-center px-2 text-white">
                <div className="bg-white/20 backdrop-blur-sm p-2.5 sm:p-3 rounded-full mb-2 shadow-inner">
                    <Search className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
                    Can't find the part you need?
                </DialogTitle>
                <DialogDescription className="text-blue-100 font-medium text-xs sm:text-sm">
                    We'll find it for you!
                </DialogDescription>
             </div>
        </div>

        <div className="p-4 sm:p-6 bg-white">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="partName" className="font-semibold text-gray-700 text-xs sm:text-sm">Part Name *</Label>
                  <Input
                    id="partName"
                    placeholder="e.g. Alternator, Headlight"
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    required
                    className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="partNumber" className="font-semibold text-gray-700 text-xs sm:text-sm">Part Number (Optional)</Label>
                  <Input
                    id="partNumber"
                    placeholder="e.g. 123-456-789"
                    value={partNumber}
                    onChange={(e) => setPartNumber(e.target.value)}
                    className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="vehicleDetails" className="font-semibold text-gray-700 text-xs sm:text-sm">Vehicle Details *</Label>
                <Input
                  id="vehicleDetails"
                  placeholder="e.g. 2018 Toyota Corolla 1.6 Prestige"
                  value={vehicleDetails}
                  onChange={(e) => setVehicleDetails(e.target.value)}
                  required
                  className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="userName" className="font-semibold text-gray-700 text-xs sm:text-sm">Your Name *</Label>
                    <Input
                        id="userName"
                        placeholder="John Doe"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        required
                        className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="contactInfo" className="font-semibold text-gray-700 text-xs sm:text-sm">Phone or Email *</Label>
                    <Input
                        id="contactInfo"
                        placeholder="john@example.com / 082 123 4567"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        required
                        className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    />
                </div>
              </div>

              <div className="pt-3 sm:pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="w-full sm:w-auto text-gray-500 hover:text-gray-700">
                    Cancel
                </Button>
                <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-lg shadow-blue-500/30 transition-all hover:translate-y-[-1px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Find My Part"
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="py-8 sm:py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Request Received!</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                We've got your details. Our team will start looking for your part immediately and contact you soon.
              </p>
              <Button onClick={() => setOpen(false)} variant="outline" className="mt-4 w-full sm:w-auto">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
