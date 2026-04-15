import { ReactNode } from "react";
import { NavBar } from "@/shared/pages/NavBar";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      <NavBar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
};
