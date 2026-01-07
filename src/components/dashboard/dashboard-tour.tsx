"use client";

import { useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

const DashboardTour = () => {
  const [run, setRun] = useState(false);
  const { theme } = useTheme();
  const pathname = usePathname();
  const [steps, setSteps] = useState<Step[]>([]);
  const [tourKey, setTourKey] = useState("");

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
              <h3 className="font-bold mb-2">Navigation Sidebar</h3>
              <p>
                This is your main command center. Access all tools to manage your
                store, products, and orders.
              </p>
            </div>
          ),
          placement: "right",
          disableBeacon: true,
        },
        {
          target: "#tour-store-switcher",
          content: (
            <div>
              <h3 className="font-bold mb-2">Store Switcher</h3>
              <p>
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
              <h3 className="font-bold mb-2">Header Actions</h3>
              <p>Access profile settings, theme toggles, and notifications.</p>
            </div>
          ),
          placement: "bottom",
        },
        {
          target: "#tour-content-area",
          content: (
            <div>
              <h3 className="font-bold mb-2">Workspace</h3>
              <p>
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
    // Matches: /dashboard/seller/stores/[storeUrl]/products
    else if (pathname.match(/\/products$/)) {
      key = "dashboard-products-tour-completed";
      currentSteps = [
        {
          target: "#tour-data-table",
          content: (
            <div>
              <h3 className="font-bold mb-2">Products Table</h3>
              <p>
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
    // Matches: /products/new OR /products/.../variants/...
    else if (pathname.includes("/products/new") || pathname.includes("/variants/")) {
      key = "dashboard-product-form-tour-completed";
      currentSteps = [
        {
          target: "#tour-product-images",
          content: (
            <div>
              <h3 className="font-bold mb-2">Product Images</h3>
              <p>Upload high-quality images for your product or variant here.</p>
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
    // Matches: /orders
    else if (pathname.match(/\/orders$/)) {
      key = "dashboard-orders-tour-completed";
      currentSteps = [
        {
          target: "#tour-orders-stats",
          content: (
            <div>
              <h3 className="font-bold mb-2">Order Statistics</h3>
              <p>Get a quick overview of your total, pending, and completed orders.</p>
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
      const tourCompleted = localStorage.getItem(key);
      // Reset run to false first to ensure a re-render if key changes, 
      // though React state updates might handle this. 
      // Better to check and set.
      if (!tourCompleted) {
         // Small timeout to allow UI to render before tour starts
         setTimeout(() => setRun(true), 500);
      } else {
        setRun(false);
      }
    } else {
      setRun(false);
    }
  }, [pathname]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      if (tourKey) {
        localStorage.setItem(tourKey, "true");
      }
    }
  };

  if (steps.length === 0) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "#ec4899",
          backgroundColor: theme === "dark" ? "#1f1f1f" : "#ffffff",
          textColor: theme === "dark" ? "#ffffff" : "#333333",
          arrowColor: theme === "dark" ? "#1f1f1f" : "#ffffff",
        },
        tooltip: {
          borderRadius: "8px",
        },
        buttonNext: {
          borderRadius: "4px",
        },
        buttonBack: {
          borderRadius: "4px",
          color: theme === "dark" ? "#ffffff" : "#333333",
        },
      }}
    />
  );
};

export default DashboardTour;
