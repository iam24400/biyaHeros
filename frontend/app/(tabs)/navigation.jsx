import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useState, useEffect } from 'react';

const DEVICE_HEIGHT = Dimensions.get('window').height;
const DEVICE_WIDTH = Dimensions.get('window').width;
const GOOGLE_MAPS_API_KEY = 'AIzaSyB_EVYbeC10C69_PXjVWCVGDog4tU1XXnY';

export default function NavigationPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [directions, setDirections] = useState([]);

  const routeInfo = {
    distance: params.distance || "5.2",
    duration: params.duration || "15",
    estimatedArrival: params.estimatedArrival || "11:30 AM",
    origin: {
      lat: parseFloat(params.originLat) || 13.7565,
      lng: parseFloat(params.originLng) || 121.0583
    },
    destination: {
      lat: parseFloat(params.destinationLat) || 13.7565,
      lng: parseFloat(params.destinationLng) || 121.0583
    }
  };

  useEffect(() => {
    fetchDirections();
  }, []);

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

  const googleMapsHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset='utf-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <style>
          html, body, #map { 
            height: 100%; 
            margin: 0; 
            padding: 0; 
            width: 100%;
          }
          #map {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
          }
        </style>
      </head>
      <body>
        <div id='map'></div>
        <script>
          let map;
          let directionsService;
          let directionsRenderer;
          let originMarker;
          let destinationMarker;
          
          function initMap() {
            const origin = { lat: ${routeInfo.origin.lat}, lng: ${routeInfo.origin.lng} };
            const destination = { lat: ${routeInfo.destination.lat}, lng: ${routeInfo.destination.lng} };
            
            // Calculate center point between origin and destination
            const center = {
              lat: (origin.lat + destination.lat) / 2,
              lng: (origin.lng + destination.lng) / 2
            };

            map = new google.maps.Map(document.getElementById('map'), {
              center: center,
              zoom: 13,
              mapTypeControl: true,
              streetViewControl: true,
              fullscreenControl: true,
              zoomControl: true
            });
            
            directionsService = new google.maps.DirectionsService();
            directionsRenderer = new google.maps.DirectionsRenderer({
              map: map,
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#4285F4',
                strokeWeight: 5
              }
            });

            // Add origin and destination markers
            originMarker = new google.maps.Marker({
              position: origin,
              map: map,
              title: 'Origin',
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/micons/red-dot.png',
                scaledSize: new google.maps.Size(32, 32),
              },
            });

            destinationMarker = new google.maps.Marker({
              position: destination,
              map: map,
              title: 'Destination',
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/micons/blue-dot.png',
                scaledSize: new google.maps.Size(32, 32),
              },
            });

            // Draw route
            const request = {
              origin: origin,
              destination: destination,
              travelMode: 'DRIVING',
            };

            directionsService.route(request, function(result, status) {
              if (status === 'OK') {
                directionsRenderer.setDirections(result);
              }
            });
          }
        </script>
        <script async defer
          src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap">
        </script>
      </body>
    </html>
  `;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Navigation</Text>
      </View>

      <View style={styles.mapContainer}>
        <WebView
          originWhitelist={['*']}
          source={{ html: googleMapsHtml }}
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
            <Text style={styles.summaryValue}>{routeInfo.distance} km</Text>
          </View>
        </View>

        <View style={styles.summaryItem}>
          <Ionicons name="flag-outline" size={24} color="#007bff" />
          <View style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Arrival Time</Text>
            <Text style={styles.summaryValue}>{routeInfo.estimatedArrival}</Text>
          </View>
        </View>
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Turn-by-Turn Directions</Text>
        {directions.map((step, index) => (
          <View key={index} style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.instructionContent}>
              <Text style={styles.instructionText}>{step.instruction}</Text>
              <View style={styles.stepDetails}>
                <Text style={styles.stepDistance}>{step.distance}</Text>
                <Text style={styles.stepDuration}>{step.duration}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.endRouteButton}
        onPress={() => router.push("/route")}
      >
        <Text style={styles.endRouteText}>End Navigation</Text>
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
  instructionsContainer: {
    padding: 16,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  instructionContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  instructionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  stepDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  stepDistance: {
    fontSize: 14,
    color: '#666',
  },
  stepDuration: {
    fontSize: 14,
    color: '#666',
  },
  endRouteButton: {
    backgroundColor: '#dc3545',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  endRouteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 