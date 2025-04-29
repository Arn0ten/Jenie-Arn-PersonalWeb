
// Follow the Deno deployment best practices for Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend";
import dayjs from "npm:dayjs";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resendApiKey = "re_GgjrzfHo_9pRgwmsK7xRkxmiwnVjiHjG6";
const resend = new Resend(resendApiKey);

export async function sendMonthsaryReminder(isTest = false, forceTest = false) {
  try {
    // Real monthsary date: every 23rd of the month
    const now = dayjs();
    const currentMonth = now.month();
    const currentYear = now.year();
    
    // Calculate the next monthsary date
    let nextMonthsaryDate = dayjs(`${currentYear}-${currentMonth + 1}-23 00:00:00`);
    
    // If today is past the 23rd, the next monthsary is in the next month
    if (now.date() > 23) {
      nextMonthsaryDate = nextMonthsaryDate.add(1, 'month');
    }
    
    // Calculate anniversary (September 23 each year)
    const currentAnniversaryYear = now.month() >= 8 ? currentYear + 1 : currentYear;
    const nextAnniversaryDate = dayjs(`${currentAnniversaryYear}-09-23 00:00:00`);
    
    // Calculate time differences
    const diffToMonthsaryInDays = nextMonthsaryDate.diff(now, 'day');
    const diffToMonthsaryInHours = nextMonthsaryDate.diff(now, 'hour');
    const diffToAnniversaryInDays = nextAnniversaryDate.diff(now, 'day');
    const diffToAnniversaryInHours = nextAnniversaryDate.diff(now, 'hour');
    
    // Check if we should send an email based on the time difference
    const shouldSendMonthsaryEmail = diffToMonthsaryInDays === 3 || 
                                     diffToMonthsaryInDays === 1 || 
                                     diffToMonthsaryInHours === 15 || 
                                     diffToMonthsaryInHours === 1;
                                     
    const shouldSendAnniversaryEmail = diffToAnniversaryInDays === 3 || 
                                       diffToAnniversaryInDays === 1 || 
                                       diffToAnniversaryInHours === 15 || 
                                       diffToAnniversaryInHours === 1;
    
    if (shouldSendMonthsaryEmail || shouldSendAnniversaryEmail || isTest || forceTest) {
      // Determine which event we're sending an email about
      const isAnniversary = shouldSendAnniversaryEmail && !isTest && !forceTest;
      const eventType = isAnniversary ? "Anniversary" : "Monthsary";
      const diffInDays = isAnniversary ? diffToAnniversaryInDays : diffToMonthsaryInDays;
      const diffInHours = isAnniversary ? diffToAnniversaryInHours : diffToMonthsaryInHours;
      const eventDate = isAnniversary ? nextAnniversaryDate : nextMonthsaryDate;
      
      // If it's a test, override with a short time
      const displayDiff = (isTest || forceTest) ? "TEST MODE" : (diffInDays > 0 ? `${diffInDays} day(s)` : `${diffInHours} hour(s)`);
      const years = isAnniversary ? currentAnniversaryYear - 2023 : null;
      const yearText = years ? ` - ${years} Year${years > 1 ? 's' : ''}` : '';
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px #ccc;">
            <h2 style="text-align: center; color: #FF4B91;">${eventType} Reminder${yearText} ❤️</h2>
            <div style="text-align: center; margin: 20px 0;">
              <img src="https://blmuvicbfduadqsrarhn.supabase.co/storage/v1/object/public/couple-images/heart-logo.png" 
                   alt="Heart Logo" style="max-width: 100px; margin: 0 auto;">
            </div>
            <p style="font-size: 18px; text-align: center;">Your ${eventType.toLowerCase()} is coming up in 
              <strong style="color: #FF4B91; font-size: 24px;">${displayDiff}!</strong>
            </p>
            <p style="font-size: 16px; text-align: center;">${(isTest || forceTest) ? 'This is a TEST email.' : `Date: ${eventDate.format('MMMM D, YYYY')}`}</p>
            <hr style="border: 1px solid #f0f0f0; margin: 20px 0;">
            <p style="text-align: center; font-size: 16px;">Don't forget to celebrate your special day!</p>
            <div style="background-color: #FFF0F5; border-radius: 8px; padding: 15px; margin-top: 20px;">
              <p style="text-align: center; margin: 0; color: #555;">
                "Love is composed of a single soul inhabiting two bodies." - Aristotle
              </p>
            </div>
            <div style="text-align: center; margin-top: 25px;">
              <a href="https://jeniearn.tech" 
                 style="background-color: #FF4B91; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Visit Our Website
              </a>
            </div>
          </div>
          <p style="text-align: center; margin-top: 15px; font-size: 12px; color: #999;">
            This is an automated reminder for Jenie and Arn
          </p>
        </div>
      `;

      console.log(`Attempting to send ${(isTest || forceTest) ? 'TEST' : eventType} email to both recipients...`);
      
      // Always send the email if forceTest is true
      if (forceTest) {
        console.log("Force test mode, sending email regardless of conditions");
      }
      
      const data = await resend.emails.send({
        from: 'noreply@jeniearn.tech', // Using your verified domain
        to: [
          'a.bautista.129340.tc@umindanao.edu.ph',
          'j.pahayahay.122943.tc@umindanao.edu.ph',
        ],
        subject: `❤️ ${eventType} Reminder${(isTest || forceTest) ? ' (TEST)' : ''}!`,
        html: htmlContent,
      });

      console.log(`Email sent successfully:`, data);
      return data;
    } else {
      console.log("No email sent - not within notification timeframe");
      return { message: "Not within notification timeframe" };
    }
  } catch (error) {
    console.error('Error sending reminder:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse the request body to check for test parameters
    let isTest = false;
    let forceTest = false;
    
    try {
      const body = await req.json();
      isTest = !!body?.test;
      forceTest = !!body?.forceTest;
    } catch (e) {
      // If parsing fails, assume it's not a test
      console.log("Could not parse request body, assuming not a test");
    }
    
    console.log(`Function invoked, test mode: ${isTest}, force test: ${forceTest}`);
    
    const result = await sendMonthsaryReminder(isTest, forceTest);
    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in monthsary-reminder:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});