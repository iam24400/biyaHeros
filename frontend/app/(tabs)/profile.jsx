import { useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity, Image, Modal, Switch, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [isEligibleForDiscount, setIsEligibleForDiscount] = useState(false);
  const [discountType, setDiscountType] = useState('');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const router = useRouter();
  const { user, logout } = useAuth();

  const discountTypes = ["Student", "Senior Citizen", "PWD (Persons with Disabilities)"];

  const AVATAR_CHOICES = [
    "https://api.dicebear.com/6.x/fun-emoji/png?seed=Jeepney",
    "https://api.dicebear.com/6.x/fun-emoji/png?seed=TrafficHero",
    "https://api.dicebear.com/6.x/fun-emoji/png?seed=Commuter1",
    "https://api.dicebear.com/6.x/fun-emoji/png?seed=TravelerPinoy",
    "https://api.dicebear.com/6.x/fun-emoji/png?seed=BikerBoi",
  ];

  // Initialize state from user data
  useState(() => {
    if (user) {
      setIsEligibleForDiscount(user.isDiscounted || false);
      setDiscountType(user.discountType || '');
      setSelectedAvatar(user.avatar || AVATAR_CHOICES[0]); // Default to first avatar if no avatar
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
      // await updateUserProfile({
      //   isDiscounted: isEligibleForDiscount,
      //   discountType: newDiscountType || discountType
      // });
      Alert.alert(
        "Success",
        "Discount status updated successfully"
      );
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert(
        "Error",
        "Failed to update discount status. Please try again."
      );
    }
  };

  const handleUpdateAvatar = async (avatarUrl) => {
    try {
      setSelectedAvatar(avatarUrl);
      // await updateUserProfile({ avatar: avatarUrl });
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
        <Text style={styles.name}>{user?.name || 'Biya Hero'}</Text>
        <Text style={styles.email}>{user?.email || '@biyahero.gmail.com'}</Text>
        <Text style={styles.memberSince}>
          Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
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
            { backgroundColor: isEligibleForDiscount ? '#4CAF50' : '#FF5252' }
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
                onValueChange={(value) => {
                  setIsEligibleForDiscount(value);
                  if (!value) setDiscountType('');
                }}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={isEligibleForDiscount ? '#007AFF' : '#f4f3f4'}
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
                    onPress={() => setDiscountType(type)}
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
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  handleUpdateDiscount();
                  setShowDiscountModal(false);
                }}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDiscountModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
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
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
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
    backgroundColor: '#007AFF',
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
    backgroundColor: '#007AFF',
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