
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function TestEmailButton() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleTestEmail = async () => {
    setIsLoading(true);
    try {
      console.log("Calling monthsary-reminder edge function...");
      const { data, error } = await supabase.functions.invoke('monthsary-reminder');
      
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
      console.error('Error sending test email:', error);
      toast({
        title: "Error sending test email",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleTestEmail}
      className="bg-pink-500 hover:bg-pink-600 text-white"
      disabled={isLoading}
    >
      {isLoading ? "Sending..." : "Test Monthsary Email"}
    </Button>
  );
}
