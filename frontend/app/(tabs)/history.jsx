import { View, Text, Button, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, Modal, Pressable, ActivityIndicator, RefreshControl, Alert, Animated } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'https://biyaheros.onrender.com/api';

export default function HistoryPage() {
  const router = useRouter();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [filterBy, setFilterBy] = useState('all');
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Fetch history when the tab is focused
  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/byaHero/viewHistory?userId=12`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data = await response.json();
      console.log('Fetched History Data:', data); // Debug log
      setHistory(data);
      setFavorites(data.filter(item => item.favorite));
    } catch (error) {
      console.error('Error fetching history:', error);
      Alert.alert('Error', 'Failed to load ride history');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFavorite = async (rideId, isFavorite) => {
    try {
      const response = await fetch(`${API_URL}/byaHero/updateFavorite`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          historyId: rideId,
          isFavorite: isFavorite
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update favorite status');
      }

      const updatedHistory = history.map(ride => 
        ride.id === rideId ? { ...ride, favorite: isFavorite } : ride
      );
      setHistory(updatedHistory);
      setFavorites(updatedHistory.filter(ride => ride.favorite));
    } catch (error) {
      console.error('Error updating favorite:', error);
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const sortFavorites = (sortType) => {
    const sortedFavorites = [...favorites];
    switch (sortType) {
      case 'date':
        sortedFavorites.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'name':
        sortedFavorites.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price':
        sortedFavorites.sort((a, b) => {
          const priceA = parseInt(a.price.replace('₱', ''));
          const priceB = parseInt(b.price.replace('₱', ''));
          return priceA - priceB;
        });
        break;
    }
    
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();

    setFavorites(sortedFavorites);
    setSortBy(sortType);
    setShowSortModal(false);
  };

  const filterHistory = (filterType) => {
    setFilterBy(filterType);
    setShowFilterModal(false);
  };

  const getFilteredHistory = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (filterBy) {
      case 'thisWeek':
        return history.filter(ride => {
          const rideDate = new Date(ride.date);
          return rideDate >= startOfWeek;
        });
      case 'thisMonth':
        return history.filter(ride => {
          const rideDate = new Date(ride.date);
          return rideDate >= startOfMonth;
        });
      default:
        return history;
    }
  };

  const handleReRoute = (ride) => {
    const [origin, destination] = ride.name.split(' - ');
    router.push({
      pathname: "/route",
      params: {
        originText: origin,
        destinationText: destination,
        originLat: ride.originLat,
        originLng: ride.originLng,
        destinationLat: ride.destinationLat,
        destinationLng: ride.destinationLng
      }
    });
  };

  const renderFavoriteItem = ({ item }) => (
    <View style={styles.favoriteCard}>
      <View style={styles.favoriteCardContent}>
        <View style={styles.favoriteHeader}>
          <View style={styles.locationInfo}>
            <Text style={styles.locationText} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.updateFavoriteButton}
            onPress={() => updateFavorite(item.id, false)}
          >
            <Ionicons name="star" size={24} color="#FFD700" />
          </TouchableOpacity>
        </View>

        <View style={styles.favoriteDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              Duration: {item.duration} min
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="navigate-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              Distance: {item.distance} km
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              Fare: ₱{item.price}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.date} at {item.time}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.reRouteButton}
          onPress={() => handleReRoute(item)}
        >
          <Ionicons name="navigate" size={16} color="#fff" />
          <Text style={styles.reRouteButtonText}>Re-route</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyCardContent}>
        <View style={styles.historyHeader}>
          <View style={styles.locationInfo}>
            <Text style={styles.locationText} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => updateFavorite(item.id, !item.favorite)}
          >
            <Ionicons name={item.favorite ? "star" : "star-outline"} size={24} color={item.favorite ? "#FFD700" : "#666"} />
          </TouchableOpacity>
        </View>

        <View style={styles.historyDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              Duration: {item.duration} min
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="navigate-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              Distance: {item.distance} km
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              Fare: ₱{item.price}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.date} at {item.time}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.reRouteButton}
          onPress={() => handleReRoute(item)}
        >
          <Ionicons name="navigate" size={16} color="#fff" />
          <Text style={styles.reRouteButtonText}>Re-route</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderModalOption = (text, isSelected, onPress) => (
    <Pressable 
      style={({ pressed }) => [
        styles.modalOption,
        pressed && styles.modalOptionPressed
      ]} 
      onPress={onPress}
    >
      <Text style={[
        styles.modalOptionText,
        isSelected && styles.modalOptionSelected
      ]}>
        {text}
      </Text>
      {isSelected && <Ionicons name="checkmark" size={24} color="#007AFF" />}
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#007AFF']}
          tintColor="#007AFF"
          title="Pull to refresh..."
          titleColor="#666"
        />
      }
    >
      {/* Favorites Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.title}>Favorites</Text>
        <TouchableOpacity 
          onPress={() => setShowSortModal(true)}
          style={styles.actionButton}
        >
          <Ionicons name="swap-vertical" size={20} color="#007AFF" />
          <Text style={styles.actionButtonText}>Re-order</Text>
        </TouchableOpacity>
      </View>

      {favorites.length === 0 ? (
        <Text style={styles.emptyText}>No favorites yet.</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFavoriteItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
          contentContainerStyle={{ paddingRight: 10 }}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
          onEndReachedThreshold={0.5}
        />
      )}

      {/* Ride History Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.title}>Ride History</Text>
        <TouchableOpacity 
          onPress={() => setShowFilterModal(true)}
          style={styles.actionButton}
        >
          <Ionicons name="filter" size={20} color="#007AFF" />
          <Text style={styles.actionButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {getFilteredHistory().map((ride, index) => (
        <View key={ride.id}>
          {renderHistoryItem({ item: ride, index })}
        </View>
      ))}

      {/* Sort Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSortModal}
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort Favorites</Text>
            {renderModalOption('By Date', sortBy === 'date', () => sortFavorites('date'))}
            {renderModalOption('By Name', sortBy === 'name', () => sortFavorites('name'))}
            {renderModalOption('By Price', sortBy === 'price', () => sortFavorites('price'))}
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowSortModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilterModal}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter History</Text>
            {renderModalOption('All Rides', filterBy === 'all', () => filterHistory('all'))}
            {renderModalOption('This Week', filterBy === 'thisWeek', () => filterHistory('thisWeek'))}
            {renderModalOption('This Month', filterBy === 'thisMonth', () => filterHistory('thisMonth'))}
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  reorderText: {
    color: "#007AFF",
    fontSize: 16,
  },
  filterText: {
    color: "#007AFF",
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  favoriteCard: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteCardContent: {
    padding: 16,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationInfo: {
    flex: 1,
    marginRight: 8,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  favoriteDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  reRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  reRouteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyText: {
    textAlign: "center",
    color: "gray",
    marginBottom: 20,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyCardContent: {
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  locationInfo: {
    flex: 1,
    marginRight: 8,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  historyDetails: {
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  favoriteButton: {
    padding: 4,
    marginLeft: 8,
  },
  updateFavoriteButton: {
    padding: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  modalOptionPressed: {
    backgroundColor: '#F0F8FF',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  timeDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  timeDateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  actionButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});
