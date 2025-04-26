
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Menu, X, Heart } from 'lucide-react';

const Navbar = () => {
  const { isLoggedIn, userName, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm shadow-sm py-4 px-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="text-pink-500 fill-pink-500 h-6 w-6" />
            <h1 className="text-pink-500 text-2xl font-bold cursive">Jenie & Arn</h1>
          </Link>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-pink-500"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/' 
                  ? 'text-pink-500' 
                  : 'text-gray-600 hover:text-pink-500'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/timeline" 
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/timeline' 
                  ? 'text-pink-500' 
                  : 'text-gray-600 hover:text-pink-500'
              }`}
            >
              Timeline
            </Link>
            <Link 
              to="/gallery" 
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/gallery' 
                  ? 'text-pink-500' 
                  : 'text-gray-600 hover:text-pink-500'
              }`}
            >
              Gallery
            </Link>
            <Link 
              to="/about" 
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/about' 
                  ? 'text-pink-500' 
                  : 'text-gray-600 hover:text-pink-500'
              }`}
            >
              About
            </Link>

            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-pink-500">Hi, {userName}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={logout}
                  className="border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2 space-y-3 animate-fade-in">
            <Link 
              to="/" 
              className={`block py-2 text-sm font-medium ${
                location.pathname === '/' 
                  ? 'text-pink-500' 
                  : 'text-gray-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/timeline" 
              className={`block py-2 text-sm font-medium ${
                location.pathname === '/timeline' 
                  ? 'text-pink-500' 
                  : 'text-gray-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Timeline
            </Link>
            <Link 
              to="/gallery" 
              className={`block py-2 text-sm font-medium ${
                location.pathname === '/gallery' 
                  ? 'text-pink-500' 
                  : 'text-gray-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Gallery
            </Link>
            <Link 
              to="/about" 
              className={`block py-2 text-sm font-medium ${
                location.pathname === '/about' 
                  ? 'text-pink-500' 
                  : 'text-gray-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>

            {isLoggedIn ? (
              <div className="pt-2 border-t border-gray-100">
                <span className="block text-sm text-pink-500 mb-2">Hi, {userName}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="pt-2 border-t border-gray-100">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white"
                  >
                    Login
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
