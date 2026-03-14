/**
 * Central Configuration for Business Logic
 * Edit these values directly to change application behavior.
 */

module.exports = {
  // 1. Logo Configuration
  logos: {
    mainLogo: "kitchentrack_logo.jpg",
    kitchen1: "nightwok_logo.jpg",
    kitchen2: "biryani_logo.jpg"
  },

  // 2. Email Reminder Configuration
  // Reminder Day: 0 for last day of month, 1-28 for specific day
  // Reminder Time: 24-hour format "HH:MM"
  reminder: {
    day: 0, 
    time: "09:00",
    email: process.env.EMAIL_USER || "owner@kitchentrack.com"
  },

  // 3. OTP Configuration (Forgot Password)
  // Define the phone numbers that will receive OTPs
  otp: {
    phoneNumbers: ["+91 9876543210", "+91 8888888888"]
  }
};
