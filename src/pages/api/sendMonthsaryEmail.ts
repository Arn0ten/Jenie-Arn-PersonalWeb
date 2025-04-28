import { Resend } from "resend";
import dayjs from "dayjs";

const resend = new Resend(
  process.env.RESEND_API_KEY || "your_resend_api_key_here",
);

export async function sendMonthsaryReminder() {
  const monthsaryDate = dayjs("2025-05-01 00:00:00");
  const now = dayjs();
  const diffInHours = monthsaryDate.diff(now, "hour");
  const diffInDays = monthsaryDate.diff(now, "day");

  if (
    diffInDays === 3 ||
    diffInDays === 1 ||
    diffInHours === 15 ||
    diffInHours === 1
  ) {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px #ccc;">
          <h2 style="text-align: center; color: #FF4B91;">Monthsary Reminder ❤️</h2>
          <div style="text-align: center; margin: 20px 0;">
            <img src="https://blmuvicbfduadqsrarhn.supabase.co/storage/v1/object/public/couple-images/heart-logo.png" 
                 alt="Heart Logo" style="max-width: 100px; margin: 0 auto;">
          </div>
          <p style="font-size: 18px; text-align: center;">Your monthsary is coming up in 
            <strong style="color: #FF4B91; font-size: 24px;">${diffInDays > 0 ? `${diffInDays} day(s)` : `${diffInHours} hour(s)`}!</strong>
          </p>
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

    try {
      const data = await resend.emails.send({
        from: "noreply@jeniearn.tech",
        to: [
          "a.bautista.129340.tc@umindanao.edu.ph",
          "j.pahayahay.122943.tc@umindanao.edu.ph",
        ],
        subject: "❤️ Monthsary Reminder!",
        html: htmlContent,
      });

      console.log("Email sent:", data);
    } catch (error) {
      console.error("Error sending monthsary reminder:", error);
    }
  }
}
