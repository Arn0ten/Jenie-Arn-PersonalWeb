"use client";

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Component that tracks route changes and saves the current route to sessionStorage
 */
const RouteChangeTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Save current route to sessionStorage when it changes
    // Don't save login page to prevent redirect loops
    if (location.pathname !== "/login") {
      sessionStorage.setItem("lastRoute", location.pathname + location.search);
    }
  }, [location]);

  // This component doesn't render anything
  return null;
};

export default RouteChangeTracker;
