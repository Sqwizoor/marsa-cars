"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";

interface Step {
  target: string;
  content: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right" | "center";
}

const DashboardTour = () => {
  const [run, setRun] = useState(false);
  const pathname = usePathname();
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [tourKey, setTourKey] = useState("");
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    let currentSteps: Step[] = [];
    let key = "";

    // 1. General Dashboard (Home)
    // Matches: /dashboard/seller/stores/[storeUrl] exactly
    if (pathname.match(/\/dashboard\/seller\/stores\/[^/]+$/)) {
      key = "dashboard-home-tour-completed";
      currentSteps = [
        {
          target: "#tour-sidebar",
          content: (
            <div>
              <h3 className="font-bold mb-2 text-base text-gray-900 dark:text-white">Navigation Sidebar</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This is your main command center. Access all tools to manage your
                store, products, and orders.
              </p>
            </div>
          ),
          placement: "right",
        },
        {
          target: "#tour-store-switcher",
          content: (
            <div>
              <h3 className="font-bold mb-2 text-base text-gray-900 dark:text-white">Store Switcher</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Have multiple stores? Click here to switch between them or create
                a new one.
              </p>
            </div>
          ),
          placement: "right",
        },
        {
          target: "#tour-header",
          content: (
            <div>
              <h3 className="font-bold mb-2 text-base text-gray-900 dark:text-white">Header Actions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Access profile settings, theme toggles, and notifications.</p>
            </div>
          ),
          placement: "bottom",
        },
        {
          target: "#tour-content-area",
          content: (
            <div>
              <h3 className="font-bold mb-2 text-base text-gray-900 dark:text-white">Workspace</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This is your main workspace. It displays stats, forms, and tables
                based on your selection.
              </p>
            </div>
          ),
          placement: "center",
        },
      ];
    }
    // 2. Products Page
    else if (pathname.match(/\/products$/)) {
      key = "dashboard-products-tour-completed";
      currentSteps = [
        {
          target: "#tour-data-table",
          content: (
            <div>
              <h3 className="font-bold mb-2 text-base text-gray-900 dark:text-white">Products Table</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                View and manage your inventory here. You can edit or delete
                products directly from this list.
              </p>
            </div>
          ),
          placement: "center",
        },
        {
          target: "#tour-table-search",
          content: "Search for specific products by name.",
          placement: "bottom",
        },
        {
          target: "#tour-table-new-tab-button",
          content: "Click here to add a new product to your store.",
          placement: "left",
        },
      ];
    }
    // 3. Create / Edit Product Page
    else if (pathname.includes("/products/new") || pathname.includes("/variants/")) {
      key = "dashboard-product-form-tour-completed";
      currentSteps = [
        {
          target: "#tour-product-images",
          content: (
            <div>
              <h3 className="font-bold mb-2 text-base text-gray-900 dark:text-white">Product Images</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Upload high-quality images for your product or variant here.</p>
            </div>
          ),
          placement: "bottom",
        },
        {
          target: "#tour-product-name",
          content: "Enter the name of your product.",
          placement: "bottom",
        },
        {
          target: "#tour-product-description",
          content: "Provide a detailed description to attract customers.",
          placement: "bottom",
        },
        {
          target: "#tour-product-category",
          content: "Select the appropriate category and sub-category.",
          placement: "bottom",
        },
        {
          target: "#tour-product-submit",
          content: "Don't forget to save your changes!",
          placement: "top",
        },
      ];
    }
    // 4. Orders Page
    else if (pathname.match(/\/orders$/)) {
      key = "dashboard-orders-tour-completed";
      currentSteps = [
        {
          target: "#tour-orders-stats",
          content: (
            <div>
              <h3 className="font-bold mb-2 text-base text-gray-900 dark:text-white">Order Statistics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Get a quick overview of your total, pending, and completed orders.</p>
            </div>
          ),
          placement: "bottom",
        },
        {
          target: "#tour-data-table",
          content: "View and manage all your customer orders here.",
          placement: "top",
        },
      ];
    }

    if (key && currentSteps.length > 0) {
      setSteps(currentSteps);
      setTourKey(key);
      setCurrentStep(0);
      try {
        const tourCompleted = localStorage.getItem(key);
        if (!tourCompleted) {
          const timer = setTimeout(() => setRun(true), 600);
          return () => clearTimeout(timer);
        } else {
          setRun(false);
        }
      } catch {
        setRun(false);
      }
    } else {
      setRun(false);
    }
  }, [pathname]);

  const updatePosition = useCallback(() => {
    if (!run || steps.length === 0) return;
    const step = steps[currentStep];
    if (!step || step.placement === "center") {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(step.target);
    if (el) {
      try {
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      } catch {}
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [run, steps, currentStep]);

  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [updatePosition]);

  const finishTour = useCallback(() => {
    setRun(false);
    if (tourKey) {
      try {
        localStorage.setItem(tourKey, "true");
      } catch {}
    }
  }, [tourKey]);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      finishTour();
    }
  }, [currentStep, steps.length, finishTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!run) return;
      if (e.key === "Escape") finishTour();
      if (e.key === "ArrowRight") nextStep();
      if (e.key === "ArrowLeft") prevStep();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [run, finishTour, nextStep, prevStep]);

  if (!run || steps.length === 0) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  // Calculate tooltip placement style
  const getTooltipStyle = () => {
    if (!targetRect || step.placement === "center") {
      return {
        position: "fixed" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const tooltipWidth = 340;
    const padding = 16;
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1000;
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;

    let top = targetRect.bottom + padding;
    let left = targetRect.left;

    if (step.placement === "right") {
      top = Math.max(padding, Math.min(viewportHeight - 200, targetRect.top));
      left = targetRect.right + padding;
    } else if (step.placement === "left") {
      top = Math.max(padding, Math.min(viewportHeight - 200, targetRect.top));
      left = targetRect.left - tooltipWidth - padding;
    } else if (step.placement === "top") {
      top = Math.max(padding, targetRect.top - 180);
      left = targetRect.left;
    }

    // Keep inside viewport boundaries
    if (left + tooltipWidth > viewportWidth - padding) {
      left = viewportWidth - tooltipWidth - padding;
    }
    if (left < padding) left = padding;
    if (top + 180 > viewportHeight - padding) {
      top = Math.max(padding, targetRect.top - 180);
    }

    return {
      position: "fixed" as const,
      top: `${top}px`,
      left: `${left}px`,
    };
  };

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-auto">
      {/* Target spotlight highlight */}
      {targetRect && (
        <div
          style={{
            position: "fixed",
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            borderRadius: 12,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55)",
            border: "2px solid #ec4899",
            pointerEvents: "none",
            zIndex: 99999,
            transition: "all 0.25s ease-in-out",
          }}
        />
      )}

      {/* Dim backdrop when center placed */}
      {!targetRect && (
        <div
          onClick={finishTour}
          className="fixed inset-0 bg-black/60 transition-opacity"
        />
      )}

      {/* Tooltip Card */}
      <div
        style={getTooltipStyle()}
        className="w-[90vw] max-w-[360px] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl p-5 z-[100000] transition-all duration-200"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-zinc-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-pink-600 dark:text-pink-400">
            Guide • Step {currentStep + 1} of {steps.length}
          </span>
          <button
            onClick={finishTour}
            aria-label="Close tour"
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-md transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-sm text-gray-700 dark:text-gray-200 min-h-[60px]">
          {typeof step.content === "string" ? (
            <p className="leading-relaxed">{step.content}</p>
          ) : (
            step.content
          )}
        </div>

        <div className="flex items-center justify-between pt-4 mt-2">
          <button
            onClick={finishTour}
            className="text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition font-medium"
          >
            Skip tour
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}
            <button
              onClick={nextStep}
              className="flex items-center gap-1 text-xs px-4 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-medium shadow-sm transition"
            >
              {isLast ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTour;
