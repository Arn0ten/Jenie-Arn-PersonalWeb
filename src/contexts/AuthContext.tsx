"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";
import { checkAuth } from "../lib/supabase";
import Cookies from "js-cookie";

interface AuthContextType {
  isLoggedIn: boolean;
  userName: string | null;
  login: (password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userName: null,
  login: async () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const inactivityTimeout = 10 * 60 * 1000; // 10 minutes in milliseconds

  // Initialize auth state from cookies
  useEffect(() => {
    const authStatus = Cookies.get("isLoggedIn");
    const name = Cookies.get("userName");

    if (authStatus === "true" && name) {
      setIsLoggedIn(true);
      setUserName(name);
      setLastActivity(Date.now());
    }
  }, []);

  // Track user activity
  useEffect(() => {
    const updateLastActivity = () => {
      setLastActivity(Date.now());
      // Update cookie expiration on activity
      if (isLoggedIn) {
        Cookies.set("isLoggedIn", "true", { expires: 1 }); // 1 day
        if (userName) {
          Cookies.set("userName", userName, { expires: 1 });
        }
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
      if (isLoggedIn && Date.now() - lastActivity > inactivityTimeout) {
        console.log("User inactive for too long, logging out");
        handleLogout();
      }
    }, 60000); // Check every minute

    // Handle tab/browser close
    const handleBeforeUnload = () => {
      // We don't log out on tab close, but we update the last activity timestamp
      // This way if they come back within the inactivity period, they're still logged in
      Cookies.set("lastActivity", Date.now().toString(), { expires: 1 });
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
      const isValid = await checkAuth(password, name);

      if (isValid) {
        setIsLoggedIn(true);
        setUserName(name);
        setLastActivity(Date.now());

        // Set cookies with 1 day expiration
        Cookies.set("isLoggedIn", "true", { expires: 1 });
        Cookies.set("userName", name, { expires: 1 });

        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName(null);

    // Remove cookies
    Cookies.remove("isLoggedIn");
    Cookies.remove("userName");
    Cookies.remove("lastActivity");
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, userName, login, logout: handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
