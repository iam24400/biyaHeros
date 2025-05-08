import cron from "cron";
import https from "https";

// run every 10 minute, this makes the deployed backend server remain active in render.com
// as free tier account will make the server disconnected if there was no activity after 15 minutes
const job = new cron.CronJob("*/10 * * * *", function () {
  https
    .get("https://biyaheros.onrender.com/api/byaHero/biyaheros", (res) => {
      if (res.statusCode === 200) console.log("GET request sent successfully");
      else console.log("GET request failed", res.statusCode);
    })
    .on("error", (err) => console.error("Error while sending request", err));
});

export default job;