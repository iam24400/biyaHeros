import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useState, useEffect } from 'react';

const DEVICE_HEIGHT = Dimensions.get('window').height;
const DEVICE_WIDTH = Dimensions.get('window').width;
const GOOGLE_MAPS_API_KEY = 'AIzaSyB_EVYbeC10C69_PXjVWCVGDog4tU1XXnY';
const API_URL = 'https://biyaheros.onrender.com/api'; // Updated to use the correct backend URL

export default function NavigationPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [directions, setDirections] = useState([]);
  
  console.log('Navigation page mounted');
  console.log('Raw params:', params);
  
  let routeData = null;
  try {
    routeData = params.routeData ? JSON.parse(params.routeData) : null;
    console.log('Successfully parsed route data:', routeData);
  } catch (error) {
    console.error('Error parsing route data:', error);
    console.log('Raw routeData string:', params.routeData);
  }
  
  const routeInfo = {
    distance: params.distance || "0",
    duration: params.duration || "0",
    estimatedArrival: params.estimatedArrival || "N/A",
    origin: {
      lat: parseFloat(params.originLat) || 13.7565,
      lng: parseFloat(params.originLng) || 121.0583
    },
    destination: {
      lat: parseFloat(params.destinationLat) || 13.7565,
      lng: parseFloat(params.destinationLng) || 121.0583
    }
  };
  console.log('Constructed route info:', routeInfo);
  const [mapHtml, setMapHtml] = useState('');

  useEffect(() => {
    console.log('Navigation page useEffect triggered');
    if (routeData) {
      console.log('Generating map HTML with route data');
      const mapHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}"></script>
            <style>
              html, body, #map {
                height: 100%;
                margin: 0;
                padding: 0;
              }
            </style>
          </head>
          <body>
            <div id="map"></div>
            <script>
              function initMap() {
                console.log('Initializing map');
                const map = new google.maps.Map(document.getElementById('map'), {
                  center: { lat: ${(routeInfo.origin.lat + routeInfo.destination.lat) / 2}, 
                          lng: ${(routeInfo.origin.lng + routeInfo.destination.lng) / 2}},
                  zoom: 12
                });

                // Add origin marker
                new google.maps.Marker({
                  position: { lat: ${routeInfo.origin.lat}, lng: ${routeInfo.origin.lng} },
                  map: map,
                  icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#4CAF50',
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 2
                  }
                });

                // Add destination marker
                new google.maps.Marker({
                  position: { lat: ${routeInfo.destination.lat}, lng: ${routeInfo.destination.lng} },
                  map: map,
                  icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#F44336',
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 2
                  }
                });

                // Draw route segments
                const routeData = ${JSON.stringify(routeData)};
                console.log('Drawing route segments:', routeData);
                const bounds = new google.maps.LatLngBounds();

                // Draw each segment with its color
                routeData.points.forEach((segment, index) => {
                  console.log('Drawing segment', index + 1);
                  const path = segment.map(point => ({
                    lat: point.latitude,
                    lng: point.longitude
                  }));

                  // Use the color from the first point of the segment
                  const color = segment[0].color || '#000000';

                  new google.maps.Polyline({
                    path: path,
                    geodesic: true,
                    strokeColor: color,
                    strokeOpacity: 1.0,
                    strokeWeight: 5,
                    map: map
                  });

                  // Extend bounds to include all points
                  path.forEach(point => bounds.extend(point));
                });

                // Add intersection markers if they exist
                if (routeData.intersections) {
                  console.log('Adding intersection markers');
                  routeData.intersections.forEach(intersection => {
                    new google.maps.Marker({
                      position: { lat: intersection.latitude, lng: intersection.longitude },
                      map: map,
                      icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#FFC107',
                        fillOpacity: 1,
                        strokeColor: '#FFFFFF',
                        strokeWeight: 2
                      }
                    });
                  });
                }

                // Fit map to show all route segments
                map.fitBounds(bounds);
                console.log('Map initialization complete');
              }

              window.onload = initMap;
            </script>
          </body>
        </html>
      `;

      console.log('Setting map HTML');
      setMapHtml(mapHtml);
    } else {
      console.log('No route data available');
    }
  }, [routeData, routeInfo]);

  const fetchDirections = async () => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${routeInfo.origin.lat},${routeInfo.origin.lng}&destination=${routeInfo.destination.lat},${routeInfo.destination.lng}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const steps = data.routes[0].legs[0].steps.map(step => ({
          instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
          distance: step.distance.text,
          duration: step.duration.text
        }));
        setDirections(steps);
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
    }
  };

  const handleEndNavigation = async () => {
    try {
      // Calculate fare based on distance
      const distanceInKm = parseFloat(routeInfo.distance);
      let baseFare = 13; // Base fare for less than 4 km
      
      if (distanceInKm > 4) {
        const additionalKm = Math.ceil(distanceInKm - 4); // Round up to nearest km
        baseFare += additionalKm; // Add ₱1 for each additional km
      }

      // Apply 20% discount if passengerType is true
      const discount = params.passengerType === 'true' ? 0.2 : 0;
      const finalFare = baseFare * (1 - discount);

      // Get userId from route parameters or use a default
      const userId = parseInt(params.userId) || 12;

      // Store the route in history
      const response = await fetch(`${API_URL}/byaHero/storeHistory`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          destination: String(params.destinationText || 'Route'),
          startLocation: String(params.originText || 'Current Location'),
          estimatedTime: String(routeInfo.duration),
          fare: finalFare,
          distance: distanceInKm,
          passengerType: params.passengerType // Store passengerType with the history
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to store route in history');
      }

      // Navigate back to home
      router.push('/');
    } catch (error) {
      console.error('Error storing route in history:', error);
      Alert.alert('Error', error.message || 'Failed to store route in history');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.mapContainer}>
        <WebView
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          style={{ height: DEVICE_HEIGHT * 0.4, width: '100%' }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scrollEnabled={false}
          nestedScrollEnabled={true}
        />
      </View>

      <View style={styles.routeSummary}>
        <View style={styles.summaryItem}>
          <Ionicons name="time-outline" size={24} color="#007bff" />
          <View style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Estimated Time</Text>
            <Text style={styles.summaryValue}>{routeInfo.duration} minutes</Text>
          </View>
        </View>

        <View style={styles.summaryItem}>
          <Ionicons name="navigate-outline" size={24} color="#007bff" />
          <View style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Distance</Text>
            <Text style={styles.summaryValue}>{parseFloat(routeInfo.distance).toFixed(2)} km</Text>
          </View>
        </View>

        <View style={styles.summaryItem}>
          <Ionicons name="flag-outline" size={24} color="#007bff" />
          <View style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Arrival Time</Text>
            <Text style={styles.summaryValue}>{routeInfo.estimatedArrival}</Text>
          </View>
        </View>

        <View style={styles.summaryItem}>
          <Ionicons name="cash-outline" size={24} color="#007AFF" />
          <View style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Fare</Text>
            <Text style={styles.summaryValue}>
              {(() => {
                const baseFare = routeInfo.distance < 4 ? 13 : 13 + (routeInfo.distance - 4);
                const discount = params.passengerType === 'true' ? 0.2 : 0;
                const finalFare = baseFare * (1 - discount);
                return `₱${finalFare.toFixed(2)}${discount > 0 ? ' (20% off)' : ''}`;
              })()}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.endButton}
        onPress={handleEndNavigation}
      >
        <Text style={styles.endButtonText}>End Navigation</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    padding: 16,
    paddingTop: 50,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  mapContainer: {
    height: DEVICE_HEIGHT * 0.4,
    width: '100%',
    marginBottom: 16,
  },
  routeSummary: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryText: {
    marginLeft: 16,
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  endButton: {
    backgroundColor: '#dc3545',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  endButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 