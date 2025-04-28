"use client";

import type React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface UploadProgressIndicatorProps {
  progress: number;
  isUploading: boolean;
}

const UploadProgressIndicator: React.FC<UploadProgressIndicatorProps> = ({
  progress,
  isUploading,
}) => {
  if (!isUploading) return null;

  return (
    <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white rounded-lg shadow-lg p-3 flex items-center space-x-3"
      >
        <Loader2 className="animate-spin text-romance-primary h-5 w-5" />
        <div className="w-48">
          <div className="text-sm font-medium mb-1 flex justify-between">
            <span>Uploading images</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-romance-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UploadProgressIndicator;
