"use client";

import { useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useTheme } from "next-themes";

const DashboardTour = () => {
  const [run, setRun] = useState(false);
  const { theme } = useTheme();

  const steps: Step[] = [
    {
      target: "#tour-sidebar",
      content: (
        <div>
          <h3 className="font-bold mb-2">Navigation Sidebar</h3>
          <p>
            This is your main command center. From here, you can access all the
            tools you need to manage your store, products, and orders.
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
            Have multiple stores? Click here to easily switch between them or
            create a new one.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: "#tour-sidebar-nav",
      content: (
        <div>
          <h3 className="font-bold mb-2">Menu Items</h3>
          <p>
            Use these links to navigate to specific sections like Products,
            Orders, Analytics, and Settings.
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
          <p>
            Access your profile settings, switch themes, and view notifications
            here.
          </p>
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
            This is your main workspace where you'll see your dashboard stats,
            forms, and tables depending on the selected menu item.
          </p>
        </div>
      ),
      placement: "center",
    },
  ];

  useEffect(() => {
    // Check if the tour has been completed before
    const tourCompleted = localStorage.getItem("dashboard-tour-completed");
    if (!tourCompleted) {
      setRun(true);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem("dashboard-tour-completed", "true");
    }
  };

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
          primaryColor: "#ec4899", // Using a pink-ish color to match the theme
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
        }
      }}
    />
  );
};

export default DashboardTour;
