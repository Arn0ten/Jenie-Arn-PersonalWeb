"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";
import { checkAuth } from "../lib/supabase";
import Cookies from "js-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextType {
  isLoggedIn: boolean;
  userName: string | null;
  login: (password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userName: null,
  login: async () => false,
  logout: () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const inactivityTimeout = 10 * 60 * 1000; // 10 minutes in milliseconds

  const location = useLocation();
  const navigate = useNavigate();

  // Save current route to sessionStorage when it changes
  useEffect(() => {
    if (location.pathname !== "/login") {
      sessionStorage.setItem("lastRoute", location.pathname + location.search);
    }
  }, [location]);

  // Initialize auth state from cookies with improved error handling
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const authStatus = Cookies.get("isLoggedIn");
        const name = Cookies.get("userName");
        const lastRoute = sessionStorage.getItem("lastRoute");

        if (authStatus === "true" && name) {
          setIsLoggedIn(true);
          setUserName(name);
          setLastActivity(Date.now());
        }

        // Handle redirect after refresh if needed
        if (
          lastRoute &&
          location.pathname === "/login" &&
          authStatus === "true"
        ) {
          navigate(lastRoute, { replace: true });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Reset auth state on error
        setIsLoggedIn(false);
        setUserName(null);
        Cookies.remove("isLoggedIn");
        Cookies.remove("userName");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [navigate, location.pathname]);

  // Track user activity with improved error handling
  useEffect(() => {
    const updateLastActivity = () => {
      try {
        setLastActivity(Date.now());
        // Update cookie expiration on activity
        if (isLoggedIn) {
          Cookies.set("isLoggedIn", "true", { expires: 1 }); // 1 day
          if (userName) {
            Cookies.set("userName", userName, { expires: 1 });
          }
        }
      } catch (error) {
        console.error("Error updating activity:", error);
      }
    };

    // Events to track user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => {
      window.addEventListener(event, updateLastActivity);
    });

    // Check for inactivity
    const inactivityCheck = setInterval(() => {
      try {
        if (isLoggedIn && Date.now() - lastActivity > inactivityTimeout) {
          console.log("User inactive for too long, logging out");
          handleLogout();
          toast.info("You've been logged out due to inactivity");
        }
      } catch (error) {
        console.error("Error in inactivity check:", error);
      }
    }, 60000); // Check every minute

    // Handle tab/browser close
    const handleBeforeUnload = () => {
      try {
        // We don't log out on tab close, but we update the last activity timestamp
        // This way if they come back within the inactivity period, they're still logged in
        Cookies.set("lastActivity", Date.now().toString(), { expires: 1 });
      } catch (error) {
        console.error("Error in beforeunload handler:", error);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateLastActivity);
      });
      clearInterval(inactivityCheck);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isLoggedIn, userName, lastActivity, inactivityTimeout]);

  const login = async (password: string, name: string) => {
    try {
      setIsLoading(true);
      const isValid = await checkAuth(password, name);

      if (isValid) {
        setIsLoggedIn(true);
        setUserName(name);
        setLastActivity(Date.now());

        // Set cookies with 1 day expiration
        Cookies.set("isLoggedIn", "true", { expires: 1 });
        Cookies.set("userName", name, { expires: 1 });

        // Redirect to last route if available
        const lastRoute = sessionStorage.getItem("lastRoute");
        if (lastRoute) {
          navigate(lastRoute, { replace: true });
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      setIsLoggedIn(false);
      setUserName(null);

      // Remove cookies
      Cookies.remove("isLoggedIn");
      Cookies.remove("userName");
      Cookies.remove("lastActivity");

      // Clear last route
      sessionStorage.removeItem("lastRoute");

      // Redirect to login
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error during logout. Please refresh the page.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userName,
        login,
        logout: handleLogout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
