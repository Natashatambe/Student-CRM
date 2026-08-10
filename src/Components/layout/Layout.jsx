import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { ToastProvider } from "../ui/toast";
import FrapButton from "../ui/frap-button";

function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  // Auto-collapse on small screens initially
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#faf9f5] text-[#141413] flex relative w-full max-w-full overflow-x-hidden font-sans-body">
        {/* Sidebar */}
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* Main Application Column */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out w-full max-w-full ${
            collapsed ? "ml-0 md:ml-16" : "ml-0 md:ml-52"
          }`}
        >
          {/* Navbar */}
          <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />

          {/* Main Content Viewport */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in-50 duration-300 overflow-x-hidden">
            {children}
          </main>
        </div>

        {/* Coral Action Floating Button */}
        <FrapButton />
      </div>
    </ToastProvider>
  );
}

export default Layout;