// file: RoutePage.js

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Dimensions, Alert, Modal, FlatList
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const DEVICE_HEIGHT = Dimensions.get('window').height;
const DEVICE_WIDTH = Dimensions.get('window').width;
const GOOGLE_MAPS_API_KEY = 'AIzaSyB_EVYbeC10C69_PXjVWCVGDog4tU1XXnY';

export default function RoutePage() {
  const [originName, setOriginName] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [selectedTab, setSelectedTab] = useState('alangilan');
  const [location, setLocation] = useState(null);
  const [mapFullScreen, setMapFullScreen] = useState(false);
  const [tapMode, setTapMode] = useState('destination');
  const webviewRef = useRef(null);
  const [showLocationOptions, setShowLocationOptions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [routeInfo, setRouteInfo] = useState({ 
    distance: null, 
    duration: null,
    instructions: [],
    estimatedArrival: null
  });
  const [calculatedDistance, setCalculatedDistance] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const router = useRouter();

  const alangilanStops = [
    { name: 'Terminal', time: '9:51' },
    { name: 'Lawas/Calikanto', time: '10:15' },
    { name: 'Diversion Road', time: '10:30' },
    { name: 'Pier', time: null }
  ];

  const possibleRoutesStops = [
    { name: 'Terminal', time: '9:51' },
    { name: 'Other Stop 1', time: '10:10' },
    { name: 'Other Stop 2', time: '10:25' },
    { name: 'Pier', time: null }
  ];

  const stopsToShow = selectedTab === 'alangilan' ? alangilanStops : possibleRoutesStops;

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
          let geocoder;
          
          function initMap() {
            map = new google.maps.Map(document.getElementById('map'), {
              center: { lat: 13.7565, lng: 121.0583 },
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

            geocoder = new google.maps.Geocoder();

            // Add click listener after map is initialized
            google.maps.event.addListener(map, 'click', function(event) {
              geocoder.geocode({
                location: event.latLng
              }, function(results, status) {
                if (status === 'OK' && results[0]) {
                  const coords = {
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng(),
                    name: results[0].formatted_address
                  };
                  markDestination(coords.lat, coords.lng);
                  window.ReactNativeWebView.postMessage(JSON.stringify({ 
                    clicked: coords,
                    placeName: results[0].formatted_address
                  }));
                }
              });
            });
          }
          
          function drawRoute(start, end) {
            const request = {
              origin: start,
              destination: end,
              travelMode: 'DRIVING',
            };
          
            directionsService.route(request, function (result, status) {
              if (status === 'OK') {
                directionsRenderer.setDirections(result);
          
                // Extract route information
                const route = result.routes[0];
                const distance = route.legs[0].distance.value; // in meters
                const duration = route.legs[0].duration.value; // in seconds
                const steps = route.legs[0].steps.map((step) => step.instructions);
          
                // Send route info back to React Native
                window.ReactNativeWebView.postMessage(
                  JSON.stringify({
                    routeInfo: {
                      distance: distance,
                      duration: duration,
                      instructions: steps,
                    },
                  })
                );
              } else {
                console.error('Directions request failed due to ' + status);
              }
            });
          }
          
          function markOrigin(lat, lng) {
            if (originMarker) {
              originMarker.setMap(null);
            }
            originMarker = new google.maps.Marker({
              position: { lat: lat, lng: lng },
              map: map,
              title: 'Origin',
              animation: google.maps.Animation.DROP,
              draggable: true,
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/micons/red-dot.png',
                scaledSize: new google.maps.Size(32, 32),
              },
            });
          
            // Add drag end listener
            originMarker.addListener('dragend', function (event) {
              const newPosition = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
              };
              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  origin: newPosition,
                  destination: destination ? { lat: destination.lat, lng: destination.lng } : null,
                })
              );
            });
          }
          
          function markDestination(lat, lng) {
            if (destinationMarker) {
              destinationMarker.setMap(null);
            }
            destinationMarker = new google.maps.Marker({
              position: { lat: lat, lng: lng },
              map: map,
              title: 'Destination',
              animation: google.maps.Animation.DROP,
              draggable: true,
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/micons/blue-dot.png',
                scaledSize: new google.maps.Size(32, 32),
              },
            });
          
            // Add drag end listener
            destinationMarker.addListener('dragend', function (event) {
              const newPosition = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
              };
              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  origin: origin ? { lat: origin.lat, lng: origin.lng } : null,
                  destination: newPosition,
                })
              );
            });
          }
          
          window.addEventListener('message', function(event) {
            try {
              const data = JSON.parse(event.data);
              if (data.origin && data.destination) {
                drawRoute(data.origin, data.destination);
                markOrigin(data.origin.lat, data.origin.lng);
                markDestination(data.destination.lat, data.destination.lng);
              } else if (data.userLocation) {
                markOrigin(data.userLocation.lat, data.userLocation.lng);
                if (data.destination) {
                  markDestination(data.destination.lat, data.destination.lng);
                }
              } else if (data.clicked) {
                if (data.origin) {
                  markOrigin(data.origin.lat, data.origin.lng);
                }
                markDestination(data.clicked.lat, data.clicked.lng);
              } else if (data.origin) {
                markOrigin(data.origin.lat, data.origin.lng);
              }
            } catch(e) {
              console.error('Invalid message', e);
            }
          });
        </script>
        <script async defer
          src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap">
        </script>
      </body>
    </html>
  `;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    })();
  }, []);

  const geocodePlace = async (place) => {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(place)}&key=${GOOGLE_MAPS_API_KEY}&components=country:ph`;
    const res = await fetch(url);
    const data = await res.json();
    return data.predictions.map(prediction => ({
      place_id: prediction.place_id,
      description: prediction.description,
      structured_formatting: prediction.structured_formatting
    }));
  };

  const handleOriginInput = async (text) => {
    setOriginName(text);
    if (text.length > 2) {
      const suggestions = await geocodePlace(text);
      setOriginSuggestions(suggestions);
    } else {
      setOriginSuggestions([]);
    }
  };

  const handleDestinationInput = async (text) => {
    setDestinationName(text);
    if (text.length > 2) {
      const suggestions = await geocodePlace(text);
      setDestinationSuggestions(suggestions);
    } else {
      setDestinationSuggestions([]);
    }
  };

  const getPlaceDetails = async (placeId) => {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}&fields=name,formatted_address,geometry`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.result) {
      return {
        lat: data.result.geometry.location.lat,
        lng: data.result.geometry.location.lng,
        name: data.result.name,
        address: data.result.formatted_address
      };
    }
    return null;
  };

  const selectOrigin = async (item) => {
    const details = await getPlaceDetails(item.place_id);
    if (details) {
      setOriginName(details.name || details.address);
      setOrigin({ 
        lat: details.lat, 
        lng: details.lng,
        name: details.name,
        address: details.address
      });
      setOriginSuggestions([]);
      // Send origin data to WebView
      webviewRef.current?.postMessage(JSON.stringify({ 
        origin: { lat: details.lat, lng: details.lng },
        destination: destination || null
      }));
    }
  };

  const selectDestination = async (item) => {
    const details = await getPlaceDetails(item.place_id);
    if (details) {
      setDestinationName(details.name || details.address);
      setDestination({ 
        lat: details.lat, 
        lng: details.lng,
        name: details.name,
        address: details.address
      });
      setDestinationSuggestions([]);
      webviewRef.current?.postMessage(JSON.stringify({ 
        origin, 
        destination: { lat: details.lat, lng: details.lng } 
      }));
    }
  };

  const setCurrentLocationAsOrigin = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission not granted');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      setOrigin(coords);
      setOriginName('📍 Current Location');
      // Send both origin and destination to ensure both markers are shown
      webviewRef.current?.postMessage(JSON.stringify({ 
        userLocation: coords, 
        origin: coords, 
        destination: destination || null 
      }));
    } catch (err) {
      Alert.alert('Failed to fetch location');
    }
  };

  const onWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.clicked) {
        setSelectedLocation(data.clicked);
        if (data.placeName) {
          setDestinationName(data.placeName);
        }
        setShowLocationOptions(true);
      } else if (data.routeInfo) {
        const now = new Date();
        const arrivalTime = new Date(now.getTime() + data.routeInfo.duration * 1000);
        
        setRouteInfo({
          distance: (data.routeInfo.distance / 1000).toFixed(2),
          duration: Math.round(data.routeInfo.duration / 60),
          instructions: data.routeInfo.instructions.map((instruction, index) => ({
            id: index + 1,
            text: instruction
          })),
          estimatedArrival: arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        setShowInstructions(true);
      } else if (data.origin && data.destination) {
        // Update both markers when both locations are set
        webviewRef.current?.postMessage(JSON.stringify({ 
          origin: data.origin,
          destination: data.destination
        }));
      }
    } catch (e) {
      console.warn('Failed to parse WebView message:', e);
    }
  };

  const handleLocationSelect = (type) => {
    if (type === 'origin') {
      setOrigin(selectedLocation);
      setOriginName(selectedLocation.name || selectedLocation.address || 'Selected Location');
    } else {
      setDestination(selectedLocation);
      setDestinationName(selectedLocation.name || selectedLocation.address || 'Selected Location');
    }
    webviewRef.current?.postMessage(JSON.stringify({ origin, destination }));
    setShowLocationOptions(false);
  };

  const calculateRouteDistance = async () => {
    if (origin && destination) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const distance = (route.legs[0].distance.value / 1000).toFixed(2); // Convert to km
          const duration = Math.round(route.legs[0].duration.value / 60); // Convert to minutes
          
          setCalculatedDistance(distance);
          setRouteInfo({
            distance: distance,
            duration: duration,
            estimatedArrival: new Date(Date.now() + route.legs[0].duration.value * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
          setShowInstructions(true);
        }
      } catch (error) {
        console.error('Error calculating route:', error);
        Alert.alert('Error', 'Failed to calculate route. Please try again.');
      }
    }
  };

  const startRoute = () => {
    if (origin && destination) {
      // Navigate to navigation page with route information
      router.push({
        pathname: "/navigation",
        params: {
          distance: routeInfo.distance,
          duration: routeInfo.duration,
          estimatedArrival: routeInfo.estimatedArrival,
          originLat: origin.lat,
          originLng: origin.lng,
          destinationLat: destination.lat,
          destinationLng: destination.lng
        }
      });
    } else {
      Alert.alert('Error', 'Please select both origin and destination points');
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
      bounces={true}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => alert('Back')}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>BiyaHero</Text>
      </View>

      <View style={styles.distanceDetailsContainer}>
        <View style={styles.distanceHeader}>
          <Text style={styles.distanceHeaderText}>Route Details</Text>
        </View>
        
        <View style={styles.pointDetails}>
          <View style={styles.pointRow}>
            <Text style={styles.pointIcon}>📍</Text>
            <View style={styles.pointInfo}>
              <Text style={styles.pointLabel}>Starting Point</Text>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search location..."
                  value={originName}
                  onChangeText={handleOriginInput}
                />
                <TouchableOpacity 
                  style={styles.currentLocationBtn}
                  onPress={setCurrentLocationAsOrigin}
                >
                  <Text>📍</Text>
                </TouchableOpacity>
              </View>
              {originSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {originSuggestions.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => selectOrigin(item)}
                    >
                      <Text style={styles.suggestionText}>{item.description}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {origin && (
                <Text style={styles.locationName}>
                  {origin.name || origin.address}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.pointRow}>
            <Text style={styles.pointIcon}>📍</Text>
            <View style={styles.pointInfo}>
              <Text style={styles.pointLabel}>Destination</Text>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search location..."
                  value={destinationName}
                  onChangeText={handleDestinationInput}
                />
              </View>
              {destinationSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {destinationSuggestions.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => selectDestination(item)}
                    >
                      <Text style={styles.suggestionText}>{item.description}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {destination && (
                <Text style={styles.locationName}>
                  {destination.name || destination.address}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          {calculatedDistance !== null && (
            <View style={styles.estimationBox}>
              <Text style={styles.estimationTitle}>Route Estimation</Text>
              <View style={styles.estimationContent}>
                <View style={styles.estimationItem}>
                  <Text style={styles.estimationLabel}>Distance:</Text>
                  <Text style={styles.estimationDistance}>{calculatedDistance} km</Text>
                </View>
                <View style={styles.estimationItem}>
                  <Text style={styles.estimationLabel}>Estimated Time:</Text>
                  <Text style={styles.estimationTime}>{routeInfo.duration} minutes</Text>
                </View>
              </View>
            </View>
          )}

          {origin && destination && (
            <TouchableOpacity 
              style={styles.startRouteButton}
              onPress={startRoute}
            >
              <Ionicons name="navigate" size={24} color="white" />
              <Text style={styles.startRouteText}>Start Route</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.mapContainer}>
        <WebView
          ref={webviewRef}
          originWhitelist={['*']}
          source={{ html: googleMapsHtml }}
          style={{ height: DEVICE_HEIGHT * 0.5, width: '100%' }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scrollEnabled={false}
          nestedScrollEnabled={true}
          onMessage={onWebViewMessage}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
          onLoadEnd={() => {
            console.log('WebView loaded');
          }}
        />
        <TouchableOpacity style={styles.fullscreenBtn} onPress={() => setMapFullScreen(true)}>
          <Text style={{ fontSize: 16 }}>⛶</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={mapFullScreen} animationType="slide">
        <View style={styles.fullscreenWrapper}>
          <WebView
            source={{ html: googleMapsHtml }}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            ref={webviewRef}
            style={{ width: DEVICE_WIDTH, height: DEVICE_HEIGHT }}
            onMessage={onWebViewMessage}
          />
          <TouchableOpacity style={styles.exitFullscreenBtn} onPress={() => setMapFullScreen(false)}>
            <Text style={{ fontSize: 16, color: '#fff' }}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={selectedTab === 'alangilan' ? styles.activeTab : styles.inactiveTab} onPress={() => setSelectedTab('alangilan')}>
          <Text style={selectedTab === 'alangilan' ? styles.tabText : styles.tabTextGray}>Alangilan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={selectedTab === 'possibleRoutes' ? styles.activeTab : styles.inactiveTab} onPress={() => setSelectedTab('possibleRoutes')}>
          <Text style={selectedTab === 'possibleRoutes' ? styles.tabText : styles.tabTextGray}>Possible Routes</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stopList}>
        {stopsToShow.map((stop, index) => (
          <View key={index} style={styles.stopItem}>
            <Text style={styles.stopIcon}>🛑</Text>
            <Text style={styles.stopName}>{stop.name}</Text>
            {stop.time && <Text style={styles.stopTime}>{stop.time}</Text>}
          </View>
        ))}
      </View>

      <Modal
        visible={showLocationOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLocationOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Location Type</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => handleLocationSelect('origin')}>
              <Text style={styles.modalButtonText}>Set as Starting Location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => handleLocationSelect('destination')}>
              <Text style={styles.modalButtonText}>Set as Destination</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setShowLocationOptions(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32, // Extra padding at bottom for better scrolling
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backArrow: { fontSize: 20, marginRight: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  mapContainer: { 
    height: 300, // Reduced height to show more content
    borderRadius: 15, 
    overflow: 'hidden', 
    marginBottom: 20 
  },
  fullscreenBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: '#fff', padding: 6, borderRadius: 6, zIndex: 10 },
  fullscreenWrapper: { flex: 1, backgroundColor: '#000' },
  exitFullscreenBtn: { position: 'absolute', top: 40, right: 20, backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 20 },
  tabContainer: { flexDirection: 'row', marginVertical: 10 },
  activeTab: { flex: 1, padding: 10, backgroundColor: '#007bff', borderRadius: 10, marginRight: 5 },
  inactiveTab: { flex: 1, padding: 10, backgroundColor: '#ccc', borderRadius: 10, marginLeft: 5 },
  tabText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  tabTextGray: { color: '#333', textAlign: 'center', fontWeight: 'bold' },
  stopList: { marginTop: 10 },
  stopItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  stopIcon: { marginRight: 8 },
  stopName: { flex: 1 },
  stopTime: { color: 'gray' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
  },
  estimationBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  estimationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  estimationContent: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
  },
  estimationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  estimationLabel: {
    fontSize: 16,
    color: '#666',
  },
  estimationDistance: {
    fontSize: 20,
    color: '#007bff',
    fontWeight: 'bold',
  },
  estimationTime: {
    fontSize: 20,
    color: '#007bff',
    fontWeight: 'bold',
  },
  estimationDivider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 15,
  },
  instructionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  instructionsHeader: {
    backgroundColor: '#007bff',
    padding: 16,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  routeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 8,
  },
  routeStat: {
    color: '#fff',
    fontSize: 14,
  },
  instructionsList: {
    maxHeight: 300,
  },
  instructionsListContent: {
    padding: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  instructionNumber: {
    backgroundColor: '#007bff',
    color: '#fff',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  distanceDetailsContainer: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  distanceHeader: {
    backgroundColor: '#007bff',
    padding: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  distanceHeaderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pointDetails: {
    padding: 16,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pointIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  pointInfo: {
    flex: 1,
  },
  pointLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  locationName: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  distanceInfo: {
    flex: 1,
  },
  distanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  distanceValue: {
    fontSize: 20,
    color: '#007bff',
    fontWeight: 'bold',
  },
  calculateButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 16,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  recalculateButton: {
    backgroundColor: '#0056b3',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  currentLocationBtn: {
    marginLeft: 8,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 4,
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  startRouteButton: {
    flexDirection: 'row',
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startRouteText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
