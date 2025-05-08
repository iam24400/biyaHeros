import {Pool} from "pg";

// connecting to database
const client = new Pool({
  connectionString: "postgresql://postgres.vejmtccfgqxapmramgvs:biyaHero12345@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
});

console.log("connected to database")


export default client;