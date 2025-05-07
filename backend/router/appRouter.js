import express from "express";
import routeService from "../services/routeService.js";
import {viewHistory, storeHistory, updateFavorite} from "../services/historyService.js";

const router = express.Router();


router.get('/jeepneyRoutes', routeService);
router.get('/viewHistory', viewHistory);
router.post('/storeHistory', storeHistory);
router.post('/updateFavorite', updateFavorite);


export default router;