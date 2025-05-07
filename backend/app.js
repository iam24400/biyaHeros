import "dotenv/config";
import express from "express";
import cors from "cors";
import appRouter from "./router/appRouter.js"
import authRouter from "./router/authRouter.js"
import logger from './middleware/logger.js';
import cronJob from './cron/cron.js';

const app = express();
const PORT = process.env.PORT || 3000;

cronJob.start();
app.use(express.json());
app.use(cors());
app.use(logger);

app.use("/api/auth", authRouter);
app.use("/api/byaHero", appRouter);



app.listen(3000, () => {
    console.log(`Server is running at port ${PORT}`);
});
