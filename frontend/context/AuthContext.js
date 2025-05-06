import React, { createContext, useState, useContext } from 'react';
import { Alert } from 'react-native';

const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    try {
      setLoading(true);
      // Here you would typically make an API call to your backend
      // For now, we'll simulate a successful login
      if (email && password) {
        setUser({
          id: '1',
          email: email,
          name: 'Test User'
        });
        return true;
      } else {
        Alert.alert('Error', 'Please enter both email and password');
        return false;
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'An error occurred during login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 