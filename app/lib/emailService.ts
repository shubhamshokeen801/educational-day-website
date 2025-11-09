// app/lib/emailService.ts
import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter configuration
export async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log('Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Send email function
export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });

    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Email Templates
export const emailTemplates = {
  soloRegistration: (userName: string, eventName: string, isPaid: boolean, registrationFee?: number) => ({
    subject: `Registration Confirmation - ${eventName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background-color: white; color: blue; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .highlight { background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Registration Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            
            <p>Thank you for registering for <strong>${eventName}</strong>! We're excited to have you join us.</p>
            
            ${isPaid ? `
              <div class="highlight">
                <p>Registration Fee: <strong>₹${registrationFee}</strong></p>
                <p>Please complete your payment to confirm your participation if not yet paid. Visit your profile to upload payment proof.</p>
              </div>
            ` : `
              <p>Your registration is complete! No payment is required for this event.</p>
            `}
            
            <p>You can view your registration details and event information in your profile.</p>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tech-media-fest.vercel.app'}/profile" class="button">
                Go to Profile
              </a>
            </center>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
            
            <p>Best regards,<br><strong>Tech Fest Event Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  teamCreation: (userName: string, eventName: string, teamName: string, teamCode: string, isPaid: boolean, registrationFee?: number) => ({
    subject: `Team Created Successfully - ${eventName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .team-code { background-color: #1f2937; color: #10B981; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; border-radius: 6px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background-color: white; color: blue; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .highlight { background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          .info-box { background-color: #e0f2fe; padding: 15px; border-left: 4px solid #0284c7; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Team Created Successfully!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            
            <p>Your team <strong>"${teamName}"</strong> has been created for <strong>${eventName}</strong>!</p>
            
            <p><strong>Share this code with your team members:</strong></p>
            <div class="team-code">${teamCode}</div>
            
            <div class="info-box">
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Share the team code with your members</li>
                <li>Team members can join using this code</li>
                <li>You are the team leader and responsible for the team</li>
              </ul>
            </div>
            
            ${isPaid ? `
              <div class="highlight">
                <p><strong>Payment Required</strong></p>
                <p>Team Registration Fee: <strong>₹${registrationFee}</strong></p>
                <p>As the team leader, please complete payment for the entire team if not yet done. Visit your profile to upload payment proof.</p>
              </div>
            ` : ''}
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tech-media-fest.vercel.app'}/profile" class="button">
                View Team
              </a>
            </center>
            
            <p>Best regards,<br><strong>Tech Fest Event Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  teamJoin: (userName: string, eventName: string, teamName: string, leaderName: string, isPaid: boolean) => ({
    subject: `Successfully Joined Team - ${eventName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #8B5CF6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background-color: white; color: blue; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .info-box { background-color: #dbeafe; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Joined Team Successfully</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            
            <p>You have successfully joined team <strong>"${teamName}"</strong> for <strong>${eventName}</strong>!</p>
            
            <div class="info-box">
              <p><strong>Team Details:</strong></p>
              <ul>
                <li><strong>Team Leader:</strong> ${leaderName}</li>
                <li><strong>Event:</strong> ${eventName}</li>
              </ul>
            </div>
            
            <p>You can view your team details and event information in your profile.</p>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tech-media-fest.vercel.app'}/profile" class="button">
                View Team Details
              </a>
            </center>
            
            <p>Best regards,<br><strong>The Events Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  munRegistration: (
    userName: string, 
    eventName: string, 
    registrationFee: number,
    instituteName: string,
    qualification: string,
    portfolioPreference1?: string,
    portfolioPreference2?: string,
    ipCategory?: string
  ) => ({
    subject: `MUN Registration Confirmation - ${eventName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #DC2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background-color: white; color: blue; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .highlight { background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          .info-box { background-color: #e0f2fe; padding: 15px; border-left: 4px solid #0284c7; margin: 20px 0; border-radius: 4px; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: 600; color: #374151; }
          .detail-value { color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MUN Registration Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            
            <p>Thank you for registering for MUN Event- <strong>${eventName}</strong>! We're thrilled to have you participate in this Model United Nations event.</p>
            
            <div class="info-box">
              <p><strong>Registration Details:</strong></p>
              <div class="detail-row">
                <span class="detail-label">Event:</span>
                <span class="detail-value">${eventName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Institute:</span>
                <span class="detail-value">${instituteName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Qualification:</span>
                <span class="detail-value">${qualification}</span>
              </div>
              ${portfolioPreference1 ? `
              <div class="detail-row">
                <span class="detail-label">Portfolio Preference 1:</span>
                <span class="detail-value">${portfolioPreference1}</span>
              </div>
              ` : ''}
              ${portfolioPreference2 ? `
              <div class="detail-row">
                <span class="detail-label">Portfolio Preference 2:</span>
                <span class="detail-value">${portfolioPreference2}</span>
              </div>
              ` : ''}
              ${ipCategory ? `
              <div class="detail-row">
                <span class="detail-label">IP Category:</span>
                <span class="detail-value">${ipCategory}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="highlight">
              <p><strong>Payment Required</strong></p>
              <p>Registration Fee: <strong>₹${registrationFee}</strong></p>
              <p>Please complete your payment if not yet done and upload payment proof in your profile to confirm your participation.</p>
            </div>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tech-media-fest.vercel.app'}/profile" class="button">
                Complete Payment
              </a>
            </center>
            
            <p><strong>Important Notes:</strong></p>
            <ul>
              <li>Your registration will be confirmed once payment is verified</li>
              <li>Upload clear payment proof for faster verification</li>
              <li>Keep checking your profile for updates</li>
            </ul>
            
            <p>We look forward to seeing you at the event!</p>
            
            <p>Best regards,<br><strong>MUN Event Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  munPaymentUploaded: (userName: string, eventName: string) => ({
    subject: `Payment Proof Received - ${eventName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background-color: white; color: blue; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .success-box { background-color: #d1fae5; padding: 15px; border-left: 4px solid #059669; margin: 20px 0; border-radius: 4px; }
          .info-box { background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Proof Received!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            
            <div class="success-box">
              <p><strong>Payment proof uploaded successfully!</strong></p>
              <p>We have received your payment proof for the Event-<strong>${eventName}</strong>.</p>
            </div>
            
            <div class="info-box">
              <p><strong>What's Next?</strong></p>
              <ul>
                <li>Our team will verify your payment within 24-48 hours</li>
                <li>You'll receive a confirmation email once verified</li>
                <li>Check your profile for real-time status updates</li>
              </ul>
            </div>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tech-media-fest.vercel.app'}/profile" class="button">
                View Registration Status
              </a>
            </center>
            
            <p>If you have any questions or concerns, please don't hesitate to reach out to our support team.</p>
            
            <p>Best regards,<br><strong>MUN Event Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
  paymentVerified: (userName: string, eventName: string, isTeam: boolean = false, teamName?: string) => ({
  subject: `Payment Verified - ${eventName}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 24px; background-color: white; color: blue; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        .success-box { background-color: #d1fae5; padding: 20px; border-left: 4px solid #059669; margin: 20px 0; border-radius: 4px; text-align: center; }
        .checkmark { font-size: 48px; color: #059669; margin-bottom: 10px; }
        .info-box { background-color: #dbeafe; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Verified Successfully!</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${userName}</strong>,</p>
          
          <div class="success-box">
            <div class="checkmark">✓</div>
            <p style="font-size: 18px; font-weight: 600; margin: 0; color: #059669;">
              Your payment has been verified!
            </p>
          </div>
          
          <p>Great news! Your payment proof for the Event- <strong>${eventName}</strong> has been successfully verified by our team.</p>
          
          ${isTeam && teamName ? `
            <p>Your team <strong>"${teamName}"</strong> is now officially registered for the event!</p>
          ` : `
            <p>You are now officially registered for the event!</p>
          `}
          
          <div class="info-box">
            <p><strong>Registration Complete!</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Your spot in the event is confirmed</li>
              <li>Check your profile for event details and updates</li>
            </ul>
          </div>
          
          <center>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tech-media-fest.vercel.app'}/profile" class="button">
              View Event Details
            </a>
          </center>
          
          <p><strong>Important Reminders:</strong></p>
          <ul>
            <li>Save this email for your records</li>
            <li>Make sure to arrive on time for the event</li>
            <li>Bring any required documents or materials</li>
            <li>Contact us if you have any questions</li>
          </ul>
          
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>Need help? Contact us at support@yourwebsite.com</p>
        </div>
      </div>
    </body>
    </html>
  `,
}),
};