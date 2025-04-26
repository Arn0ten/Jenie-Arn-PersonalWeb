
import React, { createContext, useContext, useEffect, useState } from 'react';
import { checkAuth } from '../lib/supabase';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  isLoggedIn: boolean;
  userName: string | null;
  login: (password: string, name: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);
  const { toast } = useToast();

  // Check local storage on initial load
  useEffect(() => {
    const storedLoginStatus = localStorage.getItem('isLoggedIn');
    const storedUserName = localStorage.getItem('userName');
    
    if (storedLoginStatus === 'true' && storedUserName) {
      setIsLoggedIn(true);
      setUserName(storedUserName);
    }
  }, []);

  const login = async (password: string, name: string): Promise<boolean> => {
    try {
      const isValid = await checkAuth(password, name);
      
      if (isValid) {
        setIsLoggedIn(true);
        setUserName(name);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', name);
        toast({
          title: "Welcome back!",
          description: `Logged in as ${name}`,
        });
        return true;
      } else {
        toast({
          title: "Authentication failed",
          description: "Invalid password or name",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserName(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
