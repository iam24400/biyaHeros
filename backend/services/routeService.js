import client from "../database/postgreDB.js";
import queriesDB from "../database/queriesDB.js"

// Function to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};


// Main function to find connecting routes
const findConnectingRoutes = async (originLat, originLng, destLat, destLng) => {
  try {
    // Get all available routes
    const routes = await queriesDB.jeepney_routes();

    // Find nearest points for origin and destination on each route
    const originPoints = await Promise.all(
      routes.map(route => queriesDB.findNearestPoint(originLat, originLng, route.id))
    );
    const destPoints = await Promise.all(
      routes.map(route => queriesDB.findNearestPoint(destLat, destLng, route.id))
    );

    // Find the best combination of routes
    let bestCombination = null;
    let minDistance = Infinity;

    for (let i = 0; i < routes.length; i++) {
      for (let j = 0; j < routes.length; j++) {
        if (i === j) {
          // Same route case
          const routePoints = await queriesDB.getRoutePoints(routes[i].id);
          const originIndex = routePoints.findIndex(p => 
            p.latitude === originPoints[i].latitude && 
            p.longitude === originPoints[i].longitude
          );
          const destIndex = routePoints.findIndex(p => 
            p.latitude === destPoints[i].latitude && 
            p.longitude === destPoints[i].longitude
          );

          if (originIndex !== -1 && destIndex !== -1) {
            const distance = Math.abs(destIndex - originIndex);
            if (distance < minDistance) {
              minDistance = distance;
              bestCombination = {
                routes: [routes[i]],
                points: [routePoints.slice(
                  Math.min(originIndex, destIndex),
                  Math.max(originIndex, destIndex) + 1
                ).map(point => ({
                  ...point,
                  color: routes[i].color
                }))]
              };
            }
          }
        } else {
          // Different routes case
          const route1Points = await queriesDB.getRoutePoints(routes[i].id);
          const route2Points = await queriesDB.getRoutePoints(routes[j].id);

          // Find intersection points (closest points between routes)
          let minDist = Infinity;
          let intersection1 = null;
          let intersection2 = null;

          for (const p1 of route1Points) {
            for (const p2 of route2Points) {
              const dist = calculateDistance(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
              if (dist < minDist) {
                minDist = dist;
                intersection1 = p1;
                intersection2 = p2;
              }
            }
          }

          if (intersection1 && intersection2) {
            const totalDistance = 
              calculateDistance(originLat, originLng, originPoints[i].latitude, originPoints[i].longitude) +
              calculateDistance(destLat, destLng, destPoints[j].latitude, destPoints[j].longitude) +
              minDist;

            if (totalDistance < minDistance) {
              minDistance = totalDistance;
              bestCombination = {
                routes: [routes[i], routes[j]],
                points: [
                  route1Points.slice(
                    Math.min(
                      route1Points.findIndex(p => p.latitude === originPoints[i].latitude && p.longitude === originPoints[i].longitude),
                      route1Points.findIndex(p => p.latitude === intersection1.latitude && p.longitude === intersection1.longitude)
                    ),
                    Math.max(
                      route1Points.findIndex(p => p.latitude === originPoints[i].latitude && p.longitude === originPoints[i].longitude),
                      route1Points.findIndex(p => p.latitude === intersection1.latitude && p.longitude === intersection1.longitude)
                    ) + 1
                  ).map(point => ({
                    ...point,
                    color: routes[i].color
                  })),
                  route2Points.slice(
                    Math.min(
                      route2Points.findIndex(p => p.latitude === intersection2.latitude && p.longitude === intersection2.longitude),
                      route2Points.findIndex(p => p.latitude === destPoints[j].latitude && p.longitude === destPoints[j].longitude)
                    ),
                    Math.max(
                      route2Points.findIndex(p => p.latitude === intersection2.latitude && p.longitude === intersection2.longitude),
                      route2Points.findIndex(p => p.latitude === destPoints[j].latitude && p.longitude === destPoints[j].longitude)
                    ) + 1
                  ).map(point => ({
                    ...point,
                    color: routes[j].color
                  }))
                ],
                intersections: [
                  {
                    latitude: intersection1.latitude,
                    longitude: intersection1.longitude,
                    routeId: routes[i].id
                  },
                  {
                    latitude: intersection2.latitude,
                    longitude: intersection2.longitude,
                    routeId: routes[j].id
                  }
                ]
              };
            }
          }
        }
      }
    }

    // For single route case, add empty intersections array
    if (bestCombination && bestCombination.routes.length === 1) {
      bestCombination.intersections = [];
    }

    return bestCombination;
  } catch (error) {
    console.error('Error finding connecting routes:', error);
    throw error;
  }
}; 


// Get connecting routes between origin and destination
const routeService = async (req, res) => {
  try {
    const { originLat, originLng, destLat, destLng } = req.body;
    
    if (!originLat || !originLng || !destLat || !destLng) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const routes = await findConnectingRoutes(
      parseFloat(originLat),
      parseFloat(originLng),
      parseFloat(destLat),
      parseFloat(destLng)
    );

    if (!routes) {
      return res.status(404).json({ error: 'No routes found' });
    }

    res.status(200).json(routes);
  } catch (error) {
    console.error('Error finding routes:', error);
    res.status(500).json({ error: 'Failed to find connecting routes' });
  }
};


export default routeService;