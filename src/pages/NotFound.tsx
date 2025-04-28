
import React from 'react';
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-romance-light">
      <div className="text-center p-6 max-w-md">
        <Heart className="h-20 w-20 mx-auto text-pink-200 fill-pink-500 mb-6 animate-heart-beat" />
        <h1 className="text-4xl font-bold mb-4 text-pink-500 cursive">Oops!</h1>
        <p className="text-xl text-gray-600 mb-8">The page you're looking for couldn't be found</p>
        
        <Link to="/">
          <Button className="bg-pink-500 hover:bg-pink-600">
            Return to Home
          </Button>
        </Link>
        
        <p className="mt-8 text-gray-500 text-sm">
          Our love story continues, even if this page doesn't exist
        </p>
      </div>
    </div>
  );
};

export default NotFound;
//    <!-- AYAW TAWON NI I SQL INJECT KAY WAKAY MAKUHA DNHI HAHA! -->