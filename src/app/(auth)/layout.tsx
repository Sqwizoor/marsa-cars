import { ReactNode } from "react";
import ForceLightTheme from "@/components/force-light";

export const dynamic = 'force-dynamic';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ForceLightTheme />
      {children}
    </>
  );
}
