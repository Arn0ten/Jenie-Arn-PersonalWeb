import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import HomePage from "./HomePage";
import TimelinePage from "./TimelinePage";
import GalleryPage from "./GalleryPage";
import AboutPage from "./AboutPage";
import LoginPage from "./LoginPage";
import { AuthProvider } from "../contexts/AuthContext";

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

// "use client";

// import type React from "react";

// import { Routes, Route, Navigate } from "react-router-dom";
// import { Suspense, lazy } from "react";
// import { AuthProvider, useAuth } from "../contexts/AuthContext";
// import Navbar from "../components/Navbar";
// import { Loader2 } from "lucide-react";
// import RouteChangeTracker from "../components/RouteChangeTracker";

// // Lazy load pages for better performance
// const HomePage = lazy(() => import("./HomePage"));
// const TimelinePage = lazy(() => import("./TimelinePage"));
// const GalleryPage = lazy(() => import("./GalleryPage"));
// const AboutPage = lazy(() => import("./AboutPage"));
// const LoginPage = lazy(() => import("./LoginPage"));

// // Loading component
// const PageLoader = () => (
//   <div className="min-h-screen bg-romance-light flex items-center justify-center">
//     <div className="flex flex-col items-center gap-2">
//       <Loader2 className="h-8 w-8 animate-spin text-romance-primary" />
//       <p className="text-romance-primary font-medium">Loading page...</p>
//     </div>
//   </div>
// );

// // Protected route component
// const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
//   const { isLoggedIn, isLoading } = useAuth();

//   // Show loading state while checking auth
//   if (isLoading) {
//     return <PageLoader />;
//   }

//   // Redirect to login if not logged in
//   if (!isLoggedIn) {
//     return <Navigate to="/login" replace />;
//   }

//   return <>{children}</>;
// };

// // Main component with routes
// const Index = () => {
//   return (
//     <AuthProvider>
//       <Navbar />
//       <RouteChangeTracker />
//       <Suspense fallback={<PageLoader />}>
//         <Routes>
//           <Route
//             path="/"
//             element={
//               <ProtectedRoute>
//                 <HomePage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/timeline"
//             element={
//               <ProtectedRoute>
//                 <TimelinePage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/gallery"
//             element={
//               <ProtectedRoute>
//                 <GalleryPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/about"
//             element={
//               <ProtectedRoute>
//                 <AboutPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route path="/login" element={<LoginPage />} />
//         </Routes>
//       </Suspense>
//     </AuthProvider>
//   );
// };

// export default Index;
