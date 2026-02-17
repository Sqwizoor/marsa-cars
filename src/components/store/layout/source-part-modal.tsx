
"use client";

import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea"; // Assuming you have this component
import { submitPartRequest } from "@/actions/part-request";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { Loader2, Search } from "lucide-react";

export default function SourcePartModal() {
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
    // Check if we've already shown it this session to avoid spamming on reload
    // In a real app, you might use localStorage with a timestamp to show it once per day/week
    const sessionShown = sessionStorage.getItem("partRequestShown");
    if (sessionShown) {
        setHasShown(true);
        // If shown, setup 5 min timer only if not dismissed permanently (logic can be complex)
        // For now, let's respect user's "after 5 mins" request even if they saw it once?
        // Let's assume user visits, sees it after 2s, closes it. Then after 5 mins it shows again.
        // But if they submit, we shouldn't show it again.
    }

    const timer = setTimeout(() => {
      // Show after 1 minute
      if (!sessionStorage.getItem("partRequestSubmitted")) {
         setOpen(true);
         setHasShown(true);
         sessionStorage.setItem("partRequestShown", "true");
      }
    }, 60000); // 1 minute

    return () => {
      clearTimeout(timer);
    };
  }, []);

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
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] overflow-hidden p-0 border-0 shadow-2xl rounded-2xl z-[9999]">
        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center overflow-hidden">
            {/* Background Pattern */}
             <div className="absolute inset-0 opacity-20" 
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}>
             </div>
             
             <div className="relative z-10 flex flex-col items-center text-center p-6 text-white">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full mb-2 shadow-inner">
                    <Search className="w-8 h-8 text-white" />
                </div>
                <DialogTitle className="text-2xl font-bold tracking-tight text-white mb-1">
                    Can't find the part you need?
                </DialogTitle>
                <DialogDescription className="text-blue-100 font-medium">
                    We'll find it for you!
                </DialogDescription>
             </div>
        </div>

        <div className="p-6 bg-white">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partName" className="font-semibold text-gray-700">Part Name *</Label>
                  <Input
                    id="partName"
                    placeholder="e.g. Alternator, Headlight"
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    required
                    className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partNumber" className="font-semibold text-gray-700">Part Number (Optional)</Label>
                  <Input
                    id="partNumber"
                    placeholder="e.g. 123-456-789"
                    value={partNumber}
                    onChange={(e) => setPartNumber(e.target.value)}
                    className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleDetails" className="font-semibold text-gray-700">Vehicle Details *</Label>
                <Input
                  id="vehicleDetails"
                  placeholder="e.g. 2018 Toyota Corolla 1.6 Prestige"
                  value={vehicleDetails}
                  onChange={(e) => setVehicleDetails(e.target.value)}
                  required
                  className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="userName" className="font-semibold text-gray-700">Your Name *</Label>
                    <Input
                        id="userName"
                        placeholder="John Doe"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        required
                        className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="contactInfo" className="font-semibold text-gray-700">Phone or Email *</Label>
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

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">
                    Cancel
                </Button>
                <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-lg shadow-blue-500/30 transition-all hover:translate-y-[-1px]"
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
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Request Received!</h3>
              <p className="text-gray-500 max-w-xs mx-auto">
                We've got your details. Our team will start looking for your part immediately and contact you soon.
              </p>
              <Button onClick={() => setOpen(false)} variant="outline" className="mt-6">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
