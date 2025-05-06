import express from "express";
import routeService from "../services/routeService.js";
// import historyService from "../services/historyService.js";

const router = express.Router();


router.get('/jeepneyRoutes', routeService);
// router.get('/history', historyService);


export default router;