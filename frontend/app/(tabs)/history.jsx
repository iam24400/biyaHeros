import { View, Text, Button, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, Modal, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons } from '@expo/vector-icons';

export default function HistoryPage() {
  const router = useRouter();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [filterBy, setFilterBy] = useState('all');
  
  const [history, setHistory] = useState([
    {
      id: "1",
      name: "Alangilan",
      time: "10:53 am",
      date: "03/12/2025",
      duration: "30 min",
      distance: "4 km",
      price: "₱25",
      image: "https://via.placeholder.com/300x150",
    },
    {
      id: "2",
      name: "Kumintang Ibaba",
      time: "8:00 am",
      date: "03/05/2025",
      duration: "25 min",
      distance: "9 km",
      price: "₱26",
      image: "https://via.placeholder.com/300x150",
    },
  ]);

  const [favorites, setFavorites] = useState([]);

  const addToFavorites = (ride) => {
    const alreadyFavorite = favorites.some(fav => fav.id === ride.id);
    if (!alreadyFavorite) {
      setFavorites([...favorites, ride]);
    }
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
    setFavorites(sortedFavorites);
    setSortBy(sortType);
    setShowSortModal(false);
  };

  const filterHistory = (filterType) => {
    setFilterBy(filterType);
    setShowFilterModal(false);
  };

  const getFilteredHistory = () => {
    switch (filterBy) {
      case 'thisWeek':
        return history.filter(ride => {
          const rideDate = new Date(ride.date);
          const today = new Date();
          const diffTime = Math.abs(today - rideDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7;
        });
      case 'thisMonth':
        return history.filter(ride => {
          const rideDate = new Date(ride.date);
          const today = new Date();
          return rideDate.getMonth() === today.getMonth() && 
                 rideDate.getFullYear() === today.getFullYear();
        });
      default:
        return history;
    }
  };

  const renderFavoriteItem = ({ item }) => (
    <View style={styles.favoriteCard}>
      <Image source={{ uri: item.image }} style={styles.favoriteImage} />
      <View style={styles.routeInfo}>
        <Text style={styles.routeName}>{item.name}</Text>
        <Text>{item.time} {item.date}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Favorites Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.title}>Favorites</Text>
        <TouchableOpacity onPress={() => setShowSortModal(true)}>
          <Text style={styles.reorderText}>Re-order</Text>
        </TouchableOpacity>
      </View>

      {favorites.length === 0 ? (
        <Text style={styles.emptyText}>No favorites yet.</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderFavoriteItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
        />
      )}

      {/* Ride History Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.title}>Ride History</Text>
        <TouchableOpacity onPress={() => setShowFilterModal(true)}>
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {getFilteredHistory().map((ride) => (
        <View key={ride.id} style={styles.card}>
          <Image source={{ uri: ride.image }} style={styles.image} resizeMode="cover" />
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => {
              const isFavorite = favorites.some(fav => fav.id === ride.id);
              if (isFavorite) {
                setFavorites(favorites.filter(fav => fav.id !== ride.id));
              } else {
                addToFavorites(ride);
              }
            }}
          >
            <Ionicons 
              name={favorites.some(fav => fav.id === ride.id) ? "star" : "star-outline"} 
              size={24} 
              color="#FFD700" 
            />
          </TouchableOpacity>
          <View style={styles.content}>
            <View style={styles.row}>
              <Text style={styles.routeName}>{ride.name}</Text>
            </View>
            <Text>{ride.time} {ride.date}</Text>
            <View style={styles.detailsRow}>
              <Text>{ride.duration}</Text>
              <Text>{ride.distance}</Text>
              <Text>{ride.price}</Text>
            </View>
            <Button title="Re-route" onPress={() => router.push("/route")} />
          </View>
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
            <Pressable style={styles.modalOption} onPress={() => sortFavorites('date')}>
              <Text style={styles.modalOptionText}>By Date</Text>
              {sortBy === 'date' && <Ionicons name="checkmark" size={24} color="#007AFF" />}
            </Pressable>
            <Pressable style={styles.modalOption} onPress={() => sortFavorites('name')}>
              <Text style={styles.modalOptionText}>By Name</Text>
              {sortBy === 'name' && <Ionicons name="checkmark" size={24} color="#007AFF" />}
            </Pressable>
            <Pressable style={styles.modalOption} onPress={() => sortFavorites('price')}>
              <Text style={styles.modalOptionText}>By Price</Text>
              {sortBy === 'price' && <Ionicons name="checkmark" size={24} color="#007AFF" />}
            </Pressable>
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
            <Pressable style={styles.modalOption} onPress={() => filterHistory('all')}>
              <Text style={styles.modalOptionText}>All Rides</Text>
              {filterBy === 'all' && <Ionicons name="checkmark" size={24} color="#007AFF" />}
            </Pressable>
            <Pressable style={styles.modalOption} onPress={() => filterHistory('thisWeek')}>
              <Text style={styles.modalOptionText}>This Week</Text>
              {filterBy === 'thisWeek' && <Ionicons name="checkmark" size={24} color="#007AFF" />}
            </Pressable>
            <Pressable style={styles.modalOption} onPress={() => filterHistory('thisMonth')}>
              <Text style={styles.modalOptionText}>This Month</Text>
              {filterBy === 'thisMonth' && <Ionicons name="checkmark" size={24} color="#007AFF" />}
            </Pressable>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Button title="Back to Home" onPress={() => router.push("/")} color="gray" />
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
    width: 200,
    marginRight: 10,
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  favoriteImage: {
    width: "100%",
    height: 100,
  },
  routeInfo: {
    padding: 10,
  },
  emptyText: {
    textAlign: "center",
    color: "gray",
    marginBottom: 20,
  },
  card: {
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
    position: 'relative',
  },
  image: {
    width: "100%",
    height: 150,
  },
  content: {
    padding: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  routeName: {
    fontWeight: "bold",
    fontSize: 18,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 5,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 5,
    marginBottom: 10,
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
  },
  modalOptionText: {
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
