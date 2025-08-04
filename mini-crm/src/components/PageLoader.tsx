import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Logo from "./Logo";

const PageLoader = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [location]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-white/70 dark:bg-gray-900/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center space-y-4">
      <div className="text-sm font-medium text-gray-800 dark:text-gray-200 animate-pulse">
        <Logo w-3 h-2></Logo>
      </div>
      <div className="flex space-x-2">
        <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:0s]" />
        <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:0.15s]" />
        <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:0.3s]" />
      </div>
    </div>
  );
};

export default PageLoader;
