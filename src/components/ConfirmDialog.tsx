"use client";

import type React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, HelpCircle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "delete" | "warning" | "info";
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {variant === "delete" && (
              <div className="p-2 rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            )}
            {variant === "warning" && (
              <div className="p-2 rounded-full bg-amber-100">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
            )}
            {variant === "info" && (
              <div className="p-2 rounded-full bg-blue-100">
                <HelpCircle className="h-5 w-5 text-blue-600" />
              </div>
            )}
            <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-gray-300">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            className={
              variant === "delete"
                ? "bg-red-600 hover:bg-red-700"
                : variant === "warning"
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-romance-primary hover:bg-romance-secondary"
            }
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;
