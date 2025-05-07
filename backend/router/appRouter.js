import express from "express";
import routeService from "../services/routeService.js";
import {viewHistory, storeHistory, updateFavorite} from "../services/historyService.js";
import {storeNotification, getNotifications, getUserProfile, updateNotificationSettings} from "../services/profileService.js";

const router = express.Router();

// app processes
router.get('/jeepneyRoutes', routeService);
router.get('/viewHistory', viewHistory);
router.post('/storeHistory', storeHistory);
router.post('/updateFavorite', updateFavorite);

router.post('/storeNotification', storeNotification);
router.get('/getNotifications', getNotifications);
router.get('/getUserProfile', getUserProfile);
router.post('/updateNotificationSettings', updateNotificationSettings);

router.get('/biyaheros', async (req, res) => {
    console.log("biyaheros");
});
export default router;