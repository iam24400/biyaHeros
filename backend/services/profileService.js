import queriesDB from "../database/queriesDB.js";

// store notification for a user
export const storeNotification = async (req, res) => {
    try {
        const { userId, message } = req.body;
        const result = await queriesDB.storeNotification(userId, message);
        res.status(201).json(result);
    } catch (err) {
        console.error('Error storing notification:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// retrieve notifications for a user
export const getNotifications = async (req, res) => {
    try {
        const { userId } = req.body;
        const result = await queriesDB.getNotifications(userId);
        res.status(200).json(result);
    } catch (err) {
        console.error('Error retrieving notifications:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// get user profile details
export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.body;
        const result = await queriesDB.getUserProfile(userId);
        if (!result) {
            return res.status(404).json({ error: 'User profile not found' });
        }
        res.status(200).json(result);
    } catch (err) {
        console.error('Error retrieving user profile:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// update notification settings
export const updateNotificationSettings = async (req, res) => {
    try {
        const { userId, notificationsEnabled } = req.body;
        const result = await queriesDB.updateNotificationSettings(userId, notificationsEnabled);
        if (!result) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(result);
    } catch (err) {
        console.error('Error updating notification settings:', err.message);
        res.status(500).json({ error: err.message });
    }
};

