const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Configure Nodemailer with Gmail SMTP
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use an App Password for Gmail
    },
});

/**
 * HTML Email Template
 */
const getReminderTemplate = (ownerName) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9; }
        .header { background-color: #1a1a1a; color: #ffffff; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { padding: 20px; background-color: #ffffff; }
        .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #ff4757; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        ul { padding-left: 20px; }
        li { margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>KitchenTrack Reminder</h1>
        </div>
        <div class="content">
            <p>Hello <strong>${ownerName || 'Owner'}</strong>,</p>
            <p>As the month comes to a close, it's time to finalize your financial records for your Cloud Kitchen.</p>
            <p>Please ensure you complete the following tasks:</p>
            <ul>
                <li><strong>Check Financial Records:</strong> Review all entries made during the month.</li>
                <li><strong>Verify Expenses and Sales:</strong> Match your physical receipts and platform statements (Swiggy/Zomato) with the system data.</li>
                <li><strong>Download Monthly Report:</strong> Generate and save your monthly financial summary from the dashboard.</li>
                <li><strong>Prepare Accounting:</strong> Organize your records for tax preparations and accounting purposes.</li>
            </ul>
            <p>Staying on top of your finances ensures the long-term success of your business!</p>
            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">Visit KitchenTrack Dashboard</a>
            </div>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} KitchenTrack Finance Tracker. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

/**
 * Send Month-End Reminder Email
 */
const sendMonthEndReminder = async (recipientEmail, ownerName) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('Email credentials not configured in environment variables.');
        }

        const mailOptions = {
            from: `"KitchenTrack Support" <${process.env.EMAIL_USER}>`,
            to: recipientEmail,
            subject: 'Action Required: Month-End Financial Reminder',
            html: getReminderTemplate(ownerName),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email Service] Reminder sent successfully to ${recipientEmail}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`[Email Service] Error sending reminder to ${recipientEmail}:`, error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendMonthEndReminder,
};
