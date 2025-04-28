"use client";

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X, Home, Clock, ImageIcon, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, userName, logout } = useAuth();
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const navbar = document.getElementById("mobile-navbar");
      if (isOpen && navbar && !navbar.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const navItems = [
    { name: "Home", path: "/", icon: <Home className="h-5 w-5" /> },
    {
      name: "Timeline",
      path: "/timeline",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      name: "Gallery",
      path: "/gallery",
      icon: <ImageIcon className="h-5 w-5" />,
    },
    { name: "About", path: "/about", icon: <Info className="h-5 w-5" /> },
  ];

  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-romance-primary">
                Jenie and Arn
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === item.path
                      ? "bg-romance-primary text-white"
                      : "text-gray-600 hover:bg-romance-accent/20 hover:text-romance-primary",
                  )}
                >
                  {item.name}
                </Link>
              ))}

              <div className="border-l border-gray-200 h-6 mx-2" />

              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600">
                  Hi, {userName || "User"}
                </span>
                <Button
                  onClick={logout}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-romance-primary hover:bg-romance-accent/20 flex items-center gap-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-romance-primary hover:bg-romance-accent/20 focus:outline-none"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu, show/hide based on menu state */}
      <div
        id="mobile-navbar"
        className={cn(
          "fixed inset-0 z-40 bg-white transform transition-transform ease-in-out duration-300 md:hidden",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="pt-20 pb-3 px-4 space-y-1">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <span className="text-sm font-medium text-gray-600">
              Hi, {userName || "User"}
            </span>
            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-romance-primary hover:bg-romance-accent/20 flex items-center gap-1"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>

          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-4 rounded-md text-base font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-romance-primary text-white"
                  : "text-gray-600 hover:bg-romance-accent/20 hover:text-romance-primary",
              )}
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;
