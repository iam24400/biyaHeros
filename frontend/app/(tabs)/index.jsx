import { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, Image, StyleSheet, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import LOGO from '../../assets/images/LOGO1.png';

export default function HomePage() {
  const [modalVisible, setModalVisible] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Hide splash screen after 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={LOGO}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Top Section */}
        <View style={styles.topSection}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Welcome to BiyaHero</Text>
            <Text style={styles.tagline}>Basta Batangueño, Swabe ang Biyahe!</Text>
          </View>
        </View>

        {/* Road Updates Section */}
        <Text style={styles.sectionTitle}>Road Updates</Text>

        {/* Cards */}
        <View style={styles.card}>
          <View style={styles.cardImage} />
          <View style={styles.cardContent}>
            <Text>⚠️ Warning</Text>
            <Text>🕒 12:00 PM</Text>
            <Text>📍 Location</Text>
            <Button title="More Info" onPress={() => setModalVisible(true)} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardImage} />
          <View style={styles.cardContent}>
            <Text>⚠️ Warning</Text>
            <Text>🕒 12:00 PM</Text>
            <Text>📍 Location</Text>
            <Button title="More Info" onPress={() => setModalVisible(true)} />
          </View>
        </View>

        {/* Additional Cards */}
        <View style={styles.card}>
          <View style={styles.cardImage} />
          <View style={styles.cardContent}>
            <Text>⚠️ Warning</Text>
            <Text>🕒 12:00 PM</Text>
            <Text>📍 Location</Text>
            <Button title="More Info" onPress={() => setModalVisible(true)} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardImage} />
          <View style={styles.cardContent}>
            <Text>⚠️ Warning</Text>
            <Text>🕒 12:00 PM</Text>
            <Text>📍 Location</Text>
            <Button title="More Info" onPress={() => setModalVisible(true)} />
          </View>
        </View>

        {/* Modal for More Info */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
          }}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Road Update Details</Text>
              <Text>.</Text>

              <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  scrollContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  container: { 
    flex: 1, 
    paddingHorizontal: 30, 
    paddingTop: 30,  
  },
  topSection: {
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 20,
    width: '100%',
  },
  titleContainer: {
    alignItems: "center",
    width: '100%',
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
    width: 'auto',
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    width: '100%',
  },
  sectionTitle: { 
    fontSize: 18, 
    marginVertical: 30 
  },
  card: { 
    width: "100%",
    height: 250,
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "50%",
    backgroundColor: "#ccc",
  },
  cardContent: {
    padding: 10,
    flex: 1,
    justifyContent: "space-between",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
