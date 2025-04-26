
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HomePage from './HomePage';
import TimelinePage from './TimelinePage';
import GalleryPage from './GalleryPage';
import AboutPage from './AboutPage';
import LoginPage from './LoginPage';
import { AuthProvider } from '../contexts/AuthContext';

const Index = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-romance-light">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default Index;
