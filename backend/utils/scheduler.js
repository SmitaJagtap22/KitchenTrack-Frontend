const cron = require('node-cron');
const { sendMonthEndReminder } = require('../services/emailService');
const Staff = require('../models/Staff');
const config = require('../config/businessConfig');

/**
 * Trigger reminders manually for all owners in Staff database
 */
const triggerAllReminders = async () => {
    try {
        console.log('[Scheduler] Fetching owners for manual reminders...');
        const owners = await Staff.find({ role: 'Owner' });

        if (owners.length === 0) {
            console.log('[Scheduler] No owners found in the database.');
            return { success: false, message: 'No owners found' };
        }

        let sentCount = 0;
        for (const owner of owners) {
            const email = owner.email;
            if (email) {
                console.log(`[Scheduler] Attempting to send reminder to ${owner.name} (${email})`);
                await sendMonthEndReminder(email, owner.name);
                sentCount++;
            }
        }

        return { success: true, count: sentCount };
    } catch (error) {
        console.error('[Scheduler] Error in triggerAllReminders:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Initialize Cron Schedulers
 * Checks hourly if a reminder needs to be sent based on either:
 * 1. Database Settings (Legacy/UI-based)
 * 2. businessConfig.js (Code-based)
 */
const initSchedulers = () => {
    cron.schedule('0 * * * *', async () => {
        const today = new Date();
        const currentHour = String(today.getHours()).padStart(2, '0');
        const currentDay = today.getDate();
        const isLastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() === currentDay;

        try {
            // Check for code-based reminders from businessConfig.js
            const { day: setDay, time: setTime, email: configEmail } = config.reminder;
            const [configHour] = (setTime || '09:00').split(':');

            if (configHour === currentHour) {
                if ((setDay === 0 && isLastDay) || (setDay === currentDay)) {
                    console.log(`[Scheduler] Triggering reminder to ${configEmail}`);
                    await sendMonthEndReminder(configEmail, "Owner");
                }
            }

        } catch (err) {
            console.error("[Scheduler] Error in cron execution:", err);
        }
    });

    console.log('[Scheduler] Reminder scheduler initialized (Using businessConfig.js)');
};

module.exports = {
    initSchedulers,
    triggerAllReminders
};
