import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Mail } from "lucide-react";

export function TestEmailButton({
  variant = "default" as
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link",
  size = "default" as "default" | "sm" | "lg" | "icon",
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleTestEmail = async () => {
    setIsLoading(true);
    try {
      console.log("Calling monthsary-reminder edge function...");
      const { data, error } = await supabase.functions.invoke(
        "monthsary-reminder",
        {
          body: { test: true },
        },
      );

      if (error) {
        console.error("Error from edge function:", error);
        throw error;
      }

      toast({
        title: "Test email sent!",
        description: "Please check both email inboxes.",
      });

      console.log("Email sent successfully:", data);
    } catch (error) {
      console.error("Error sending test email:", error);
      toast({
        title: "Error sending test email",
        description:
          error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceTestEmail = async () => {
    setIsLoading(true);
    try {
      console.log("Force testing email with forceTest=true parameter...");
      const { data, error } = await supabase.functions.invoke(
        "monthsary-reminder",
        {
          body: { forceTest: true },
        },
      );

      if (error) {
        console.error("Error from edge function:", error);
        throw error;
      }

      toast({
        title: "Test email sent!",
        description: "Please check both email inboxes.",
      });

      console.log("Email sent successfully:", data);
    } catch (error) {
      console.error("Error sending test email:", error);
      toast({
        title: "Error sending test email",
        description:
          error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={
            variant === "default"
              ? "bg-pink-500 hover:bg-pink-600 text-white"
              : ""
          }
        >
          <Mail size={16} className="mr-1" />
          <span className="hidden sm:inline">Email</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Email Functions</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button
            onClick={handleTestEmail}
            className="bg-pink-500 hover:bg-pink-600 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Check Email Conditions"}
          </Button>
          <Button
            onClick={handleForceTestEmail}
            className="bg-purple-500 hover:bg-purple-600 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Force Send Test Email"}
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            The "Force Send" button will send a test email regardless of the
            date conditions. You can safely use it to test if the email
            functionality is working.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
