import express from "express";
import routeService from "../services/routeService.js";

const router = express.Router();


router.get('/jeepneyRoutes', routeService);


export default router;