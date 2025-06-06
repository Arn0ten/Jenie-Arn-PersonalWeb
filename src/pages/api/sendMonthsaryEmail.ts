
import { Resend } from 'resend';
import dayjs from 'dayjs';

const resend = new Resend(process.env.RESEND_API_KEY || 're_GgjrzfHo_9pRgwmsK7xRkxmiwnVjiHjG6');

export async function sendMonthsaryReminder() {
  // Get the current date and calculate next monthsary date (23rd of each month)
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

  if (shouldSendMonthsaryEmail || shouldSendAnniversaryEmail) {
    // Determine which event we're sending an email about
    const isAnniversary = shouldSendAnniversaryEmail;
    const eventType = isAnniversary ? "Anniversary" : "Monthsary";
    const diffInDays = isAnniversary ? diffToAnniversaryInDays : diffToMonthsaryInDays;
    const diffInHours = isAnniversary ? diffToAnniversaryInHours : diffToMonthsaryInHours;
    const eventDate = isAnniversary ? nextAnniversaryDate : nextMonthsaryDate;
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
            <strong style="color: #FF4B91; font-size: 24px;">${diffInDays > 0 ? `${diffInDays} day(s)` : `${diffInHours} hour(s)`}!</strong>
          </p>
          <p style="font-size: 16px; text-align: center;">Date: ${eventDate.format('MMMM D, YYYY')}</p>
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
        from: 'noreply@jeniearn.tech',
        to: [
          'a.bautista.129340.tc@umindanao.edu.ph',
          'j.pahayahay.122943.tc@umindanao.edu.ph',
        ],
        subject: `❤️ ${eventType} Reminder!`,
        html: htmlContent,
      });

      console.log('Email sent:', data);
      return data;
    } catch (error) {
      console.error('Error sending monthsary reminder:', error);
      throw error;
    }
  } else {
    console.log("Not within notification timeframe, no email sent");
    return { message: "Not within notification timeframe" };
  }
}