import {Pool} from "pg";

const client = new Pool({
  connectionString: "postgresql://postgres.vejmtccfgqxapmramgvs:biyaHero12345@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
});

console.log("connected to database")



// PANG TRY KO LANG ITO KUNG MAKAKAQUERY SA DB, NIRUN KO LANG AY SA TERMINAL node postgreDB.js DAPAT AY NASA ROOT FOLDER NG FILE
// const ff = async (lat, lng, routeId) => {
//   const query = `
//     SELECT id, latitude, longitude, sequence
//     FROM route_point
//     WHERE jeepney_route_id = $1
//     ORDER BY 
//       (latitude - $2) * (latitude - $2) + 
//       (longitude - $3) * (longitude - $3)
//     LIMIT 1
//   `;
  
//   const result = await client.query(query, [routeId, lat, lng]);
//   console.log(result.rows[0]);
//   return result.rows[0];
// };

// ff(13.7746, 121.0664, 1);

export default client;