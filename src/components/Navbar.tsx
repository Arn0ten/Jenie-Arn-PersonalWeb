"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import {
  Menu,
  X,
  LogOut,
  User,
  Home,
  Clock,
  ImageIcon,
  Info,
  Lock,
} from "lucide-react";
import { IoLogOut } from "react-icons/io5";
import { FaLock } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { isLoggedIn, userName, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        isMenuOpen
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close sidebar when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-sm shadow-sm py-4 px-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between w-full">
            {/* Left: Logo or Greeting */}
            <div className="flex items-center justify-start flex-0">
              {isLoggedIn ? (
                <div className="flex items-center space-x-2">
                  <img
                    src={userName === "Jenie" ? "/jenie.jpg" : "/arn.jpg"}
                    alt={userName}
                    className="h-10 w-10 rounded-full object-cover border-2 border-pink-400 mr-2"
                  />
                  <span className="text-pink-500 text-lg font-semibold whitespace-nowrap">
                    Hi, <span className="font-bold">{userName}</span>
                  </span>
                </div>
              ) : (
                <Link to="/" className="flex items-center space-x-2">
                  <img
                    src="/logo-hearts.png"
                    alt="Jenie & Arn Logo"
                    className="h-12 w-12 mr-2"
                  />
                  <h1 className="text-pink-500 text-2xl font-bold font-cursive tracking-tight whitespace-nowrap">
                    Jenie & Arn
                  </h1>
                </Link>
              )}
            </div>

            {/* Right: Login/Logout button (mobile only) */}
            {isMobile && (
              <div className="flex items-center ml-auto order-2">
                {isLoggedIn ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white flex items-center"
                    onClick={logout}
                  >
                    <Lock size={18} />
                  </Button>
                ) : (
                  <Link to="/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-pink-500 bg-pink-500 text-white hover:text-pink-500 hover:bg-white hover:border-pink-500 flex items-center"
                    >
                      <Lock size={18} />
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* Mobile menu button - only show if not using bottom nav */}
            {!isMobile && (
              <button
                className="md:hidden text-pink-500 p-2 rounded-full hover:bg-pink-50 transition-colors z-[110]"
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors flex items-center space-x-1 ${
                  location.pathname === "/"
                    ? "text-pink-500"
                    : "text-gray-600 hover:text-pink-500"
                }`}
              >
                <Home size={16} />
                <span>Home</span>
              </Link>
              <Link
                to="/timeline"
                className={`text-sm font-medium transition-colors flex items-center space-x-1 ${
                  location.pathname === "/timeline"
                    ? "text-pink-500"
                    : "text-gray-600 hover:text-pink-500"
                }`}
              >
                <Clock size={16} />
                <span>Timeline</span>
              </Link>
              <Link
                to="/gallery"
                className={`text-sm font-medium transition-colors flex items-center space-x-1 ${
                  location.pathname === "/gallery"
                    ? "text-pink-500"
                    : "text-gray-600 hover:text-pink-500"
                }`}
              >
                <ImageIcon size={16} />
                <span>Gallery</span>
              </Link>
              <Link
                to="/about"
                className={`text-sm font-medium transition-colors flex items-center space-x-1 ${
                  location.pathname === "/about"
                    ? "text-pink-500"
                    : "text-gray-600 hover:text-pink-500"
                }`}
              >
                <Info size={16} />
                <span>About</span>
              </Link>

              {isLoggedIn ? (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white flex items-center space-x-1"
                  >
                    {isMobile ? <IoLogOut size={14} /> : <LogOut size={14} />}
                    <span>Logout</span>
                  </Button>
                </div>
              ) : (
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-pink-500 bg-pink-500 text-white hover:text-pink-500 hover:bg-white hover:border-pink-500 flex items-center space-x-1"
                  >
                    <FaLock size={14} />
                    <span>Login</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile navigation - Sliding sidebar (only show if not using bottom nav) */}
          {!isMobile && (
            <AnimatePresence>
              {isMenuOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-black/50 z-[101] md:hidden"
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                  />

                  {/* Sidebar */}
                  <motion.div
                    ref={sidebarRef}
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed top-0 right-0 bottom-0 w-3/4 max-w-xs bg-white shadow-xl z-[102] md:hidden flex flex-col"
                    style={{ position: "fixed", top: 0, right: 0, bottom: 0 }}
                  >
                    <div className="flex justify-between items-center p-4 border-b">
                      <h2 className="text-xl font-bold text-pink-500">Menu</h2>
                      <button
                        className="p-2 rounded-full hover:bg-pink-50 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <X size={20} className="text-gray-500" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4">
                      <div className="space-y-1 px-3">
                        <Link
                          to="/"
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            location.pathname === "/"
                              ? "bg-pink-50 text-pink-500"
                              : "text-gray-700 hover:bg-pink-50 hover:text-pink-500"
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Home size={20} />
                          <span className="font-medium">Home</span>
                        </Link>

                        <Link
                          to="/timeline"
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            location.pathname === "/timeline"
                              ? "bg-pink-50 text-pink-500"
                              : "text-gray-700 hover:bg-pink-50 hover:text-pink-500"
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Clock size={20} />
                          <span className="font-medium">Timeline</span>
                        </Link>

                        <Link
                          to="/gallery"
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            location.pathname === "/gallery"
                              ? "bg-pink-50 text-pink-500"
                              : "text-gray-700 hover:bg-pink-50 hover:text-pink-500"
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <ImageIcon size={20} />
                          <span className="font-medium">Gallery</span>
                        </Link>

                        <Link
                          to="/about"
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            location.pathname === "/about"
                              ? "bg-pink-50 text-pink-500"
                              : "text-gray-700 hover:bg-pink-50 hover:text-pink-500"
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Info size={20} />
                          <span className="font-medium">About</span>
                        </Link>
                      </div>
                    </div>

                    <div className="p-4 border-t">
                      {isLoggedIn ? (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3 px-3 py-2">
                            <img
                              src={
                                userName === "Jenie" ? "/jenie.jpg" : "/arn.jpg"
                              }
                              alt={userName}
                              className="h-10 w-10 rounded-full object-cover border-2 border-pink-400"
                            />
                            <div>
                              <p className="text-sm text-gray-500">
                                Logged in as
                              </p>
                              <p className="font-medium text-pink-500">
                                {userName}
                              </p>
                            </div>
                          </div>

                          <Button
                            onClick={() => {
                              logout();
                              setIsMenuOpen(false);
                            }}
                            className="w-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center space-x-2"
                          >
                            <LogOut size={16} />
                            <span>Logout</span>
                          </Button>
                        </div>
                      ) : (
                        <Link
                          to="/login"
                          className="block w-full"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center space-x-2">
                            <User size={16} />
                            <span>Login</span>
                          </Button>
                        </Link>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-[100] pb-safe"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex justify-around items-center h-16">
            <Link
              to="/"
              className={`flex flex-col items-center justify-center w-1/4 h-full ${
                location.pathname === "/" ? "text-pink-500" : "text-gray-500"
              }`}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Home
                  size={24}
                  className={location.pathname === "/" ? "fill-pink-100" : ""}
                />
                <span className="text-xs mt-1">Home</span>
              </motion.div>
            </Link>

            <Link
              to="/timeline"
              className={`flex flex-col items-center justify-center w-1/4 h-full ${
                location.pathname === "/timeline"
                  ? "text-pink-500"
                  : "text-gray-500"
              }`}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Clock
                  size={24}
                  className={
                    location.pathname === "/timeline" ? "fill-pink-100" : ""
                  }
                />
                <span className="text-xs mt-1">Timeline</span>
              </motion.div>
            </Link>

            <Link
              to="/gallery"
              className={`flex flex-col items-center justify-center w-1/4 h-full ${
                location.pathname === "/gallery"
                  ? "text-pink-500"
                  : "text-gray-500"
              }`}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <ImageIcon
                  size={24}
                  className={
                    location.pathname === "/gallery" ? "fill-pink-100" : ""
                  }
                />
                <span className="text-xs mt-1">Gallery</span>
              </motion.div>
            </Link>

            <Link
              to="/about"
              className={`flex flex-col items-center justify-center w-1/4 h-full ${
                location.pathname === "/about"
                  ? "text-pink-500"
                  : "text-gray-500"
              }`}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Info
                  size={24}
                  className={
                    location.pathname === "/about" ? "fill-pink-100" : ""
                  }
                />
                <span className="text-xs mt-1">About</span>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Add padding to the bottom of the page when mobile bottom nav is active */}
      {isMobile && <div className="h-16"></div>}
    </>
  );
};

export default Navbar;
