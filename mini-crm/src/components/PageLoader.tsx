import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./PageLoader.css";

const PageLoader = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [location]);

  return loading ? (
    <div className="page-loader">
      <div className="loader-bounce">
        <div></div>
        <div></div>
      </div>
    </div>
  ) : null;
};

export default PageLoader;
