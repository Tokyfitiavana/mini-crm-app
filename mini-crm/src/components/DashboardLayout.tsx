import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import PageLoader from "./PageLoader";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex h-screen bg-bg text-text-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageLoader />
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
