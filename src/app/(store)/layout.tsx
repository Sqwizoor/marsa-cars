// React
import { ReactNode } from "react";

// Components
import Header from "@/components/store/layout/header/header";
import Footer from "@/components/store/layout/footer/footer";

// Toaster
import { Toaster } from "react-hot-toast";
import ForceLightTheme from "@/components/force-light";

export const dynamic = 'force-dynamic';

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <ForceLightTheme />
      <Header />
      <div>
        {children}
      </div>
      <Footer />
      <Toaster position="top-center" />
    </div>
  );
}