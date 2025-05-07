import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity, Image, Modal, Switch, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../context/authStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import COLORS from "../../constants/colors";

const API_URL = 'https://biyaheros.onrender.com/api';

export default function ProfilePage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [isEligibleForDiscount, setIsEligibleForDiscount] = useState(false);
  const [discountType, setDiscountType] = useState('');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const discountTypes = ["Student", "Senior Citizen", "PWD (Persons with Disabilities)"];

  const AVATAR_CHOICES = [
    "https://api.dicebear.com/6.x/fun-emoji/png?seed=Jeepney",
    "https://api.dicebear.com/6.x/fun-emoji/png?seed=TrafficHero",
    "https://api.dicebear.com/6.x/fun-emoji/png?seed=Commuter1",
    "https://api.dicebear.com/6.x/fun-emoji/png?seed=TravelerPinoy",
    "https://api.dicebear.com/6.x/fun-emoji/png?seed=BikerBoi",
  ];

  // Initialize state from user data
  useEffect(() => {
    if (user) {
      setIsEligibleForDiscount(user.passengerType === 'true');
      setDiscountType(user.discountType || '');
      setSelectedAvatar(user.avatar || AVATAR_CHOICES[0]);
    }
  }, [user]);

  const handleToggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    Alert.alert(
      "Notifications",
      notificationsEnabled ? "Notifications Disabled" : "Notifications Enabled"
    );
  };

  const handleSignOut = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert(
        "Error",
        "Failed to logout. Please try again."
      );
    }
  };

  const handleUpdateDiscount = async (newDiscountType = null) => {
    try {
      const passengerType = isEligibleForDiscount ? 'true' : 'false';
      
      const updateData = {
        userId: user.id,
        passengerType: passengerType
      };

      console.log('Updating profile with:', updateData);

      const response = await fetch(`${API_URL}/byaHero/updatePassengerType`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const responseData = await response.json();
      console.log('Update response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update profile');
      }

      // Update local user state
      const updatedUser = {
        ...user,
        passengerType: passengerType,
        discountType: newDiscountType || discountType
      };
      
      // Update auth store and AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      useAuthStore.setState({ user: updatedUser });

      Alert.alert(
        "Success",
        "Discount status updated successfully"
      );
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert(
        "Error",
        error.message || "Failed to update discount status. Please try again."
      );
    }
  };

  const handleUpdateAvatar = async (avatarUrl) => {
    try {
      setSelectedAvatar(avatarUrl);
      // TODO: Implement update avatar API call
      setShowAvatarModal(false);
    } catch (error) {
      console.error('Avatar update error:', error);
      Alert.alert("Error", "Failed to update avatar. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={() => setShowAvatarModal(true)}>
          <View style={styles.avatar}>
            <Image
              source={{ uri: selectedAvatar }}
              style={styles.avatarImage}
            />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{user?.email?.split('@')[0] || 'Biya Hero'}</Text>
        <Text style={styles.email}>{user?.email || '@biyahero.gmail.com'}</Text>
        <Text style={styles.memberSince}>
          Member since {user?.timeStamp ? new Date(user.timeStamp).getFullYear() : '2024'}
        </Text>
        
        {/* Discount Status */}
        <TouchableOpacity 
          style={styles.discountStatus}
          onPress={() => setShowDiscountModal(true)}
        >
          <View style={styles.discountContent}>
            <Text style={styles.discountText}>
              {isEligibleForDiscount ? 'Eligible for Discounts' : 'Not Eligible for Discounts'}
            </Text>
            {isEligibleForDiscount && discountType && (
              <Text style={styles.discountType}>Type: {discountType}</Text>
            )}
          </View>
          <View style={[
            styles.discountIndicator,
            { backgroundColor: isEligibleForDiscount ? COLORS.success : COLORS.danger }
          ]} />
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Settings Options */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionButton} onPress={handleToggleNotifications}>
          <Text style={styles.optionText}>
            {notificationsEnabled ? "Disable Notifications" : "Enable Notifications"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Discount Edit Modal */}
      <Modal
        visible={showDiscountModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDiscountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Discount Status</Text>
            
            <View style={styles.discountToggleRow}>
              <Text style={styles.discountLabel}>Eligible for Discount?</Text>
              <Switch
                value={isEligibleForDiscount}
                onValueChange={async (value) => {
                  try {
                    // Update local state first
                    setIsEligibleForDiscount(value);
                    
                    // Prepare update data
                    const updateData = {
                      userId: user.id,
                      passengerType: value ? 'true' : 'false'
                    };

                    console.log('Updating profile with:', updateData);

                    const response = await fetch(`${API_URL}/byaHero/updatePassengerType`, {
                      method: 'POST',
                      headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(updateData)
                    });

                    const responseData = await response.json();
                    console.log('Update response:', responseData);

                    if (!response.ok) {
                      throw new Error(responseData.error || 'Failed to update profile');
                    }

                    // Update local user state
                    const updatedUser = {
                      ...user,
                      passengerType: value ? 'true' : 'false',
                      discountType: value ? discountType : ''
                    };
                    
                    // Update auth store and AsyncStorage
                    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
                    useAuthStore.setState({ user: updatedUser });

                    // Clear discount type if toggled off
                    if (!value) {
                      setDiscountType('');
                    }

                    Alert.alert(
                      "Success",
                      "Discount status updated successfully"
                    );
                  } catch (error) {
                    console.error('Update error:', error);
                    // Revert the toggle state on error
                    setIsEligibleForDiscount(!value);
                    Alert.alert(
                      "Error",
                      error.message || "Failed to update discount status. Please try again."
                    );
                  }
                }}
                trackColor={{ false: '#767577', true: COLORS.primary }}
                thumbColor={isEligibleForDiscount ? '#fff' : '#f4f3f4'}
              />
            </View>

            {isEligibleForDiscount && (
              <View style={styles.discountTypeContainer}>
                <Text style={styles.discountTypeTitle}>Select Discount Type:</Text>
                {discountTypes.map((type, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.discountTypeOption,
                      discountType === type && styles.discountTypeSelected
                    ]}
                    onPress={async () => {
                      try {
                        setDiscountType(type);
                        
                        const updateData = {
                          userId: user.id,
                          passengerType: 'true'
                        };

                        const response = await fetch(`${API_URL}/byaHero/updatePassengerType`, {
                          method: 'POST',
                          headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify(updateData)
                        });

                        const responseData = await response.json();

                        if (!response.ok) {
                          throw new Error(responseData.error || 'Failed to update profile');
                        }

                        // Update local user state
                        const updatedUser = {
                          ...user,
                          passengerType: 'true',
                          discountType: type
                        };
                        
                        // Update auth store and AsyncStorage
                        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
                        useAuthStore.setState({ user: updatedUser });

                        Alert.alert(
                          "Success",
                          "Discount type updated successfully"
                        );
                      } catch (error) {
                        console.error('Update error:', error);
                        Alert.alert(
                          "Error",
                          error.message || "Failed to update discount type. Please try again."
                        );
                      }
                    }}
                  >
                    <Text style={[
                      styles.discountTypeText,
                      discountType === type && styles.discountTypeTextSelected
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDiscountModal(false)}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Avatar Selection Modal */}
      <Modal
        visible={showAvatarModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Avatar</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {AVATAR_CHOICES.map((avatarUrl, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleUpdateAvatar(avatarUrl)}
                >
                  <Image source={{ uri: avatarUrl }} style={styles.avatarChoice} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => setShowAvatarModal(false)}
              >
                <Text style={styles.saveButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  profileSection: { alignItems: "center", marginTop: 40 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: { fontSize: 20, fontWeight: "bold", marginBottom: 5 },
  email: { fontSize: 14, color: "gray" },
  memberSince: { fontSize: 12, color: "gray", marginBottom: 10 },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 20,
    marginHorizontal: 30,
  },
  optionsContainer: {
    marginTop: 10,
    gap: 15,
  },
  optionButton: {
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  logoutButton: {
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  discountStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    width: '100%',
  },
  discountContent: {
    flex: 1,
  },
  discountText: {
    fontSize: 16,
    marginBottom: 4,
  },
  discountType: {
    fontSize: 14,
    color: '#666',
  },
  discountIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 10,
  },
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
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  discountToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  discountLabel: {
    fontSize: 16,
    color: '#333',
  },
  discountTypeContainer: {
    marginTop: 10,
  },
  discountTypeTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  discountTypeOption: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 10,
  },
  discountTypeSelected: {
    backgroundColor: COLORS.primary,
  },
  discountTypeText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  discountTypeTextSelected: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  avatarChoice: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginHorizontal: 10,
  },
}); 