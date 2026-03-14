/**
 * Application Theme & Logo Configuration
 * Edit these values directly to refresh the UI.
 */

// SIMPLE LOGO CONFIGURATION (Place image files in the public/ folder)
export const APP_LOGO = "kitchentrack_logo.jpg";
export const KITCHEN_LOGO = "nightwokdelightlogo.png";
export const KITCHEN_LOGO2 = "biryaniculturelogo.png";
export const appConfig = {
  // 1. App Identity
  appName: "KitchenTrack",

  // 2. Logo Configuration (Using the constants defined above)
  logos: {
    mainLogo: APP_LOGO,
    kitchen1: KITCHEN_LOGO, // Default kitchen logo
    kitchen2: KITCHEN_LOGO2, // Default kitchen logo
  },

  // 3. Theme Colors (Modern Professional Palette)
  colors: {
    primary: "#0f172a",    // Slate 900
    secondary: "#1e293b",  // Slate 800
    accent: "#f97316",     // Orange 500
    accentHover: "#ea580c",// Orange 600
    success: "#10b981",    // Emerald 500
    danger: "#ef4444",     // Red 500
    surface: "#ffffff",
    background: "#f8fafc", // Slate 50
    textPrimary: "#1e293b",
    textSecondary: "#64748b"
  },

  // 4. Typography
  fontFamily: "'Inter', 'Outfit', sans-serif"
};
