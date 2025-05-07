import client from "./postgreDB.js"

// store all queries from DB
const queriesDB = {

    // check existing email
    async checkExistingEmail (email) {
        try {
            const query = `SELECT email FROM public."user" WHERE email = $1`;
            const result = await client.query(query, [email]);
            return result.rows[0]?.email || null;
        } catch (err) {
            console.error('Error checking existing email:', err.message);
            throw err;
        }
    },

    // adding user to database
    async addUser (email, password, passengerType) {
        try {
            const query = `
                INSERT INTO public."user"(email, password, "passengerType") 
                VALUES ($1, $2, $3);`;
            const result = await client.query( query, [email, password, passengerType]);
            console.log(result.rows);
            return result.rows;
        } catch (err) {
            console.error('Error adding new user to database:', err.message);
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
            console.error('Error retrieving user password:', err.message);
            throw err;
        }
    },

    // retrieve passengerType, timeStamp
    async retrieveIdPassTypeAndTime (email) {
        try {
            const query = `
                SELECT "id", "passengerType", "timeStamp"::date 
                FROM public."user" WHERE email = $1`;
            const result = await client.query( query, [email]);
            console.log(result.rows[0]);
            return result.rows[0];
        } catch (err) {
            console.error('Error:', err.message);
            throw err;
        }
    },

    // find nearest point on a route
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
            console.error('Error finding nearest point on route:', err.message);
            throw err;
        }
    },

    // get all points for a route
    async getRoutePoints (routeId) {
        try {
            const query = `
                SELECT latitude, longitude, sequence 
                FROM route_point 
                WHERE jeepney_route_id = $1 
                ORDER BY sequence`;
            const result = await client.query(query, [routeId]);
            return result.rows;
        } catch (err) {
            console.error('Error retrieving route points:', err.message);
            throw err;
        }
    },

    // get all available routes
    async jeepney_routes () {
        try {
            const query = 'SELECT id, name, color FROM jeepney_route';
            const result = await client.query(query);
            return result.rows;
        } catch (err) {
            console.error('Error retrieving jeepney routes:', err.message);
            throw err;
        }
    },
      
    // update favorite in history
    async updateFavorite (historyId, isFavorite) {
        try {
            const query = `
                UPDATE public.history SET "isFavorite" = $1 
                WHERE id = $2 RETURNING id, "isFavorite"`;
            const result = await client.query(query, [isFavorite, historyId]);
            return result;
        } catch (err) {
            console.error('Error updating favorite status in history:', err.message);
            throw err;
        } 
    },

    // store ride history
    async storeHistory (userId, destination, startLocation, estimatedTime, fare) {
        try {
            const query = `
                INSERT INTO public.history (
                    user_id, 
                    destination, 
                    "startLocation", 
                    "estimatedTime", 
                    fare) 
                VALUES ($1, $2, $3, $4, $5) RETURNING id`;
            const result = await client.query(query, [userId, destination, startLocation, estimatedTime, fare]);
            return result;
        } catch (err) {
            console.error('Error storing ride history:', err.message);
            throw err;
        }
    },

    // retrieve all history records
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
                ORDER BY "timeStamp" DESC`;
            const result = await client.query(query, [userId]);
            return result;
        } catch (err) {
            console.error('Error retrieving ride history:', err.message);
            throw err;
        }
    },

    // store notification for a user
    async storeNotification(userId, message) {
        try {
            const query = `
                INSERT INTO public.notification (user_id, message) 
                VALUES ($1, $2) 
                RETURNING id, user_id, message, "timeStamp"`;
            const result = await client.query(query, [userId, message]);
            return result.rows[0];
        } catch (err) {
            console.error('Error storing notification:', err.message);
            throw err;
        }
    },

    // retrieve notifications for a user
    async getNotifications(userId) {
        try {
            const query = `
                SELECT id, user_id, message, "timeStamp" 
                FROM public.notification 
                WHERE user_id = $1 
                ORDER BY "timeStamp" DESC`;
            const result = await client.query(query, [userId]);
            return result.rows;
        } catch (err) {
            console.error('Error retrieving notifications:', err.message);
            throw err;
        }
    },

    // get user profile details
    async getUserProfile(userId) {
        try {
            const query = `
                SELECT id, email, "passengerType", "notificationsEnabled", "timeStamp"::date 
                FROM public."user" 
                WHERE id = $1`;
            const result = await client.query(query, [userId]);
            return result.rows[0];
        } catch (err) {
            console.error('Error retrieving user profile:', err.message);
            throw err;
        }
    },

    // update notification setting
    async updateNotificationSettings(userId, notificationEnabled) {
        try {
            const query = `
                UPDATE public."user" 
                SET "notificationsEnabled" = $1 
                WHERE id = $2 
                RETURNING id, "notificationsEnabled"`;
            const result = await client.query(query, [notificationEnabled, userId]);
            return result.rows[0];
        } catch (err) {
            console.error('Error updating notification settings:', err.message);
            throw err;
        }
    }
}

export default queriesDB;