import cron from "cron";
import https from "https";

const job = new cron.CronJob("*/1 * * * *", function () {
  https
    .get("https://biyaheros.onrender.com/api/byaHero/biyaheros", (res) => {
      if (res.statusCode === 200) console.log("GET request sent successfully");
      else console.log("GET request failed", res.statusCode);
    })
    .on("error", (err) => console.error("Error while sending request", err));
});

export default job;