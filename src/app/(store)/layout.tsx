// React
import { ReactNode } from "react";

// Components
import Header from "@/components/store/layout/header/header";
import Footer from "@/components/store/layout/footer/footer";

// Toaster
import { Toaster } from "react-hot-toast";

export const dynamic = 'force-dynamic';

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Header />
      <div>
        {children}
      </div>
      <Footer />
      <Toaster position="top-center" />
    </div>
  );
}