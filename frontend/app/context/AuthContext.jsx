import { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, isDiscounted) => {
    try {
      // Check if user already exists in AsyncStorage
      const existingUsers = await AsyncStorage.getItem('users');
      const users = existingUsers ? JSON.parse(existingUsers) : {};
      
      if (users[email]) {
        throw new Error('User already exists');
      }

      // Create new user
      const newUser = {
        email,
        name: email.split('@')[0], // Using email prefix as name
        isDiscounted,
        createdAt: new Date().toISOString(), // Add creation timestamp
      };

      // Save user to AsyncStorage
      users[email] = {
        ...newUser,
        password, // Note: In a real app, we would hash the password
      };

      await AsyncStorage.setItem('users', JSON.stringify(users));
      await AsyncStorage.setItem('userData', JSON.stringify(newUser));
      setUser(newUser);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const existingUsers = await AsyncStorage.getItem('users');
      const users = existingUsers ? JSON.parse(existingUsers) : {};
      
      // Check if email exists
      if (!users[email]) {
        throw new Error('Email not found. Please check your email or sign up.');
      }

      // Check if password matches
      if (users[email].password !== password) {
        throw new Error('Incorrect password. Please try again.');
      }

      const userData = {
        email: users[email].email,
        name: users[email].name,
        isDiscounted: users[email].isDiscounted,
        createdAt: users[email].createdAt, // Include creation date in user data
      };

      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Throw the error to be handled by the login page
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 