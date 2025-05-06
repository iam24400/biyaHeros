import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Modal, Switch, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEligibleForDiscount, setIsEligibleForDiscount] = useState(false);
  const [discountType, setDiscountType] = useState('');
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();

  const discountTypes = ["Student", "Senior Citizen", "PWD (Persons with Disabilities)"];

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isEligibleForDiscount && !discountType) {
      Alert.alert('Error', 'Please select a discount type');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const success = await signup(email, password, isEligibleForDiscount ? discountType : null);
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Failed to create account');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/LOGO1.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join BiyaHero today</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />
        
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons 
              name={showPassword ? "eye-off" : "eye"} 
              size={24} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons 
              name={showConfirmPassword ? "eye-off" : "eye"} 
              size={24} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.discountContainer}>
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
            <TouchableOpacity
              style={styles.discountTypeButton}
              onPress={() => setShowDiscountModal(true)}
            >
              <Text style={styles.discountTypeButtonText}>
                {discountType || 'Select Discount Type'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={handleSignup}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity 
        style={styles.loginButton}
        onPress={() => router.push('/login')}
        disabled={isLoading}
      >
        <Text style={styles.loginButtonText}>Already have an account? Sign In</Text>
      </TouchableOpacity>

      <Modal
        visible={showDiscountModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDiscountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Discount Type</Text>
            {discountTypes.map((type, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.modalOption,
                  discountType === type && styles.modalOptionSelected
                ]}
                onPress={() => {
                  setDiscountType(type);
                  setShowDiscountModal(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  discountType === type && styles.modalOptionTextSelected
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDiscountModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    gap: 15,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  discountContainer: {
    marginTop: 0,
  },
  discountToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  discountLabel: {
    fontSize: 16,
    color: '#333',
  },
  discountTypeButton: {
    borderWidth: 1,
    borderColor:'#007AFF',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    alignItems: 'center'
  },
  discountTypeButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold'
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 5,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
  },
  loginButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
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
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  modalOption: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f8f8f8',
  },
  modalOptionSelected: {
    backgroundColor: '#007AFF',
  },
  modalOptionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  modalOptionTextSelected: {
    color: '#fff',
  },
  modalCloseButton: {
    marginTop: 10,
    padding: 15,
    borderColor: '#007AFF',
    width: '100%',
    borderRadius: 8,
    borderWidth: 1
    
  },
  modalCloseButtonText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#007AFF',
    fontWeight: 'bold',
  },
}); 