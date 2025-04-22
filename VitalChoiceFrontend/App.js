import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from './config';

// Screens
import RoleSelectionScreen from './screens/RoleSelectionScreen';
import UserLoginScreen from './screens/UserLoginScreen';
import UserSignupScreen from './screens/UserSignupScreen';
import AdminLoginScreen from './screens/AdminLoginScreen';
import UserDashboard from './screens/UserDashboard';
import AdminDashboard from './screens/AdminDashboard';

const Stack = createNativeStackNavigator();

export default function App() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const adminFlag = await AsyncStorage.getItem('isAdmin');

        if (adminFlag === 'true') {
          setIsAdmin(true);
          setUserLoggedIn(false);
        } else if (token) {
          // Optional: validate token with your backend
          const response = await axios.post(`${BASE_URL}/api/user/validate-token`, {
            token,
          });

          if (response.data.valid) {
            setUserLoggedIn(true);
            setIsAdmin(false);
          } else {
            await AsyncStorage.removeItem('authToken');
            setUserLoggedIn(false);
            setIsAdmin(false);
          }
        } else {
          setUserLoggedIn(false);
          setIsAdmin(false);
        }
      } catch (err) {
        console.log('Error checking auth:', err);
        setUserLoggedIn(false);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userLoggedIn ? (
          <Stack.Screen name="UserDashboard">
            {props => (
              <UserDashboard{...props}setUserLoggedIn={setUserLoggedIn}setIsAdmin={setIsAdmin}/>
            )}
          </Stack.Screen>
        ) : isAdmin ? (
          <Stack.Screen name="AdminDashboard">
            {props => (
              <AdminDashboard{...props}setUserLoggedIn={setUserLoggedIn}setIsAdmin={setIsAdmin}/>
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
            <Stack.Screen name="UserLogin">
              {props => <UserLoginScreen {...props} setUserLoggedIn={setUserLoggedIn} />}
            </Stack.Screen>
            <Stack.Screen name="UserSignup" component={UserSignupScreen} />
            <Stack.Screen name="AdminLogin">
              {props => <AdminLoginScreen {...props} setIsAdmin={setIsAdmin} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
