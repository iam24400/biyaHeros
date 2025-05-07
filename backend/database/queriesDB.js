import client from "./postgreDB.js"


const queriesDB = {

    // check existing email
    async checkExistingEmail (email) {
        try {
            const query = `SELECT email FROM public."user" WHERE email = $1`;
            const result = await client.query(query, [email]);
            return result.rows[0]?.email || null;
        } catch (err) {
            console.error('Error:', err.message);
            throw err;
        }
    },

    // adding user to DB
    async addUser (email, password, passengerType) {
        try {
            const query = `INSERT INTO public."user"(email, password, "passengerType") VALUES ($1, $2, $3);`;
            const result = await client.query( query, [email, password, passengerType]);
            console.log(result.rows);
            return result.rows;
        } catch (err) {
            console.error('Error:', err.message);
            throw err;
        }
    },

    // retrieve password
    async retrievePassword (email) {
        try {
            const query = `SELECT password FROM public."user" WHERE email = $1`;
            const result = await client.query( query, [email]);
            console.log(result.rows[0]['password']);
            return result.rows[0]['password'];
        } catch (err) {
            console.error('Error:', err.message);
            throw err;
        }
    },

    // retrieve passengerType, timeStamp
    async retrieveIdPassTypeAndTime (email) {
        try {
            const query = `SELECT "id", "passengerType", "timeStamp"::date FROM public."user" WHERE email = $1`;
            const result = await client.query( query, [email]);
            console.log(result.rows[0]);
            return result.rows[0];
        } catch (err) {
            console.error('Error:', err.message);
            throw err;
        }
    },

    // Function to find nearest point on a route
    async findNearestPoint (lat, lng, routeId) {
        try {
            const query = `
            SELECT id, latitude, longitude, sequence FROM route_point
            WHERE jeepney_route_id = $1
            ORDER BY (latitude - $2) * (latitude - $2) + (longitude - $3) * (longitude - $3)
            LIMIT 1`;
            const result = await client.query(query, [routeId, lat, lng])
            return result.rows[0];
        } catch (err) {
            console.error('Error:', err.message);
            throw err;
        }
    },

    // Function to get all points for a route
    async getRoutePoints (routeId) {
        try {
            const query = `SELECT latitude, longitude, sequence FROM route_point WHERE jeepney_route_id = $1 ORDER BY sequence`;
            const result = await client.query(query, [routeId]);
            return result.rows;
        } catch (err) {
            console.error('Error:', err.message);
            throw err;
        }
    },

    // Get all available routes
    async jeepney_routes () {
        try {
            const query = 'SELECT id, name, color FROM jeepney_route';
            const result = await client.query(query);
            return result.rows;
        } catch (err) {
            console.error('Error:', err.message);
            throw err;
        }
    },
      
    // update favorite in history
    async updateFavorite (historyId, isFavorite) {
        try {
            const query = `UPDATE public.history SET "isFavorite" = $1 WHERE id = $2 RETURNING id, "isFavorite"`;
            const result = await client.query(query, [isFavorite, historyId]);
            return result;
        } catch (err) {
            console.error('Error:', err.message);
            throw err;
        } 
    },

    // store ride history
    async storeHistory (userId, destination, startLocation, estimatedTime, fare) {
        try {
            const query = `INSERT INTO public.history (
                    user_id, 
                    destination, 
                    "startLocation", 
                    "estimatedTime", 
                    fare, 
                    "isFavorite", 
                    "timeStamp") 
                VALUES ($1, $2, $3, $4, $5, false, CURRENT_TIMESTAMP) RETURNING id`;
            const result = await client.query(query, [userId, destination, startLocation, estimatedTime, fare]);
            return result;
        } catch (err) {
            console.error('Error:', err.message);
            throw err;
        }
    },

    // display all history records
    async viewHistory (userId) {
        try {
            const query = `
            SELECT 
                id, 
                user_id, 
                destination, 
                "startLocation", 
                "estimatedTime", 
                fare, 
                "isFavorite", 
                "timeStamp"
            FROM public.history
            WHERE user_id = $1
            ORDER BY "timeStamp" DESC
            `;
            const result = await client.query(query, [userId]);
            return result;
        } catch (error) {
            console.error('Error:', err.message);
            throw err;
        }
    }

    

}



export default queriesDB;