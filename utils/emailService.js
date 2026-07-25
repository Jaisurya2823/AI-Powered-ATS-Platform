const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

/**
 * Send an email - errors are logged but NOT thrown
 * so email failure never crashes the main flow
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️  SMTP not configured. Skipping email.');
      return;
    }

    const mailer = getTransporter();
    await mailer.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'ATS Platform'}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`📧 Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error(`❌ Email send failed to ${to}:`, error.message);
    // Intentionally not rethrowing
  }
};

// ==========================================
// EMAIL TEMPLATES
// ==========================================

const sendApplicationConfirmation = async (applicantEmail, applicantName, jobTitle, company) => {
  await sendEmail({
    to: applicantEmail,
    subject: `Application Received - ${jobTitle} at ${company}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Application Received</h2>
        <p>Hi ${applicantName},</p>
        <p>Thank you for applying to <strong>${jobTitle}</strong> at <strong>${company}</strong>.</p>
        <p>Your application has been received and is currently under review. 
           We will contact you if your profile matches our requirements.</p>
        <p>Best regards,<br/>The Recruitment Team at ${company}</p>
      </div>
    `,
  });
};

const sendStatusUpdateEmail = async (applicantEmail, applicantName, jobTitle, newStatus) => {
  const statusMessages = {
    screening: 'Your application is now under active review.',
    interview: 'Congratulations! You have been shortlisted for an interview. Our team will contact you shortly with details.',
    offered: 'Congratulations! We are pleased to extend an offer to you. Our team will reach out with the details soon.',
    rejected: 'After careful consideration, we have decided to move forward with other candidates at this time. We appreciate your interest and wish you the best.',
  };

  const message = statusMessages[newStatus] || 'Your application status has been updated.';
  const statusLabels = {
    screening: 'Under Review',
    interview: 'Interview Stage',
    offered: 'Offer Extended',
    rejected: 'Not Selected',
  };

  await sendEmail({
    to: applicantEmail,
    subject: `Application Update - ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Application Status Update</h2>
        <p>Hi ${applicantName},</p>
        <p>Regarding your application for <strong>${jobTitle}</strong>:</p>
        <p style="background: #f1f5f9; padding: 12px; border-radius: 6px; border-left: 4px solid #2563eb;">
          <strong>Status:</strong> ${statusLabels[newStatus] || newStatus}<br/>
          ${message}
        </p>
        <p>Best regards,<br/>The Recruitment Team</p>
      </div>
    `,
  });
};

module.exports = {
  sendEmail,
  sendApplicationConfirmation,
  sendStatusUpdateEmail,
};