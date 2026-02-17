// React
import { ReactNode } from "react";

// Components
import Header from "@/components/store/layout/header/header";
import Footer from "@/components/store/layout/footer/footer";
import SourcePartModal from "@/components/store/layout/source-part-modal";

// Toaster
import { Toaster } from "react-hot-toast";
import ForceLightTheme from "@/components/force-light";
import SessionProvider from "@/components/store/session-provider";

export const dynamic = 'force-dynamic';

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <ForceLightTheme />
      <SessionProvider />
      <Header />
      <div>
        {children}
      </div>
      <SourcePartModal />
      <Footer />
      <Toaster position="top-center" />
    </div>
  );
}