import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, handleApiError } from "../api/api";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isCheckingAuth: true,
  hasCheckedAuth: false,

  register: async (email, password, isEligibleForDiscount) => {
    set({ isLoading: true });
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const requestBody = {
        email,
        password,
        confirmedPass: password,
        passengerType: isEligibleForDiscount // This will be true/false
      };

      console.log('Registration request body:', requestBody);
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Registration response status:', response.status);
      const data = await response.json();
      console.log('Registration response:', data);

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);

      set({ token: data.token, user: data.user, isLoading: false });
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      set({ isLoading: false });
      return { 
        success: false, 
        error: handleApiError(error)
      };
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      console.log('Attempting login with:', { email });
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      console.log('Login response status:', response.status);
      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);

      set({ token: data.token, user: data.user, isLoading: false });
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      set({ isLoading: false });
      return { 
        success: false, 
        error: handleApiError(error)
      };
    }
  },

  checkAuth: async () => {
    if (get().hasCheckedAuth) {
      console.log('Auth already checked, skipping...');
      return;
    }

    try {
      console.log('Checking auth state...');
      const token = await AsyncStorage.getItem("token");
      const userJson = await AsyncStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;
      
      console.log('Auth state:', { token: !!token, user: !!user });
      set({ token, user });
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      console.log('Finished checking auth');
      set({ isCheckingAuth: false, hasCheckedAuth: true });
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      set({ token: null, user: null });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
})); 