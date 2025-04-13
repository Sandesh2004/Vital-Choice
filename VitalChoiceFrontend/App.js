import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';

import RoleSelectionScreen from './screens/RoleSelectionScreen';
import UserLoginScreen from './screens/UserLoginScreen';
import UserSignupScreen from './screens/UserSignupScreen';
import AdminLoginScreen from './screens/AdminLoginScreen';
import UserDashboard from './screens/UserDashboard'; 
import AdminDashboard from './screens/AdminDashboard';


const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(async () => {
      const adminFlag = await AsyncStorage.getItem('isAdmin');
      const firebaseUser = auth.currentUser;
  
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAdmin(false);
      } else if (adminFlag === 'true') {
        setUser(null);
        setIsAdmin(true);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
  
      setLoading(false);
    }, 1000); // check every second
  
    return () => clearInterval(interval);
  }, []);
  


  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Loading...</Text>
    </View>
  );


  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <Stack.Screen
            name="UserDashboard"
            component={UserDashboard}
            options={{ headerShown: false }}
          />
        ) : isAdmin ? (
          <Stack.Screen
            name="AdminDashboard"
            component={AdminDashboard}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
            <Stack.Screen name="UserLogin" component={UserLoginScreen} />
            <Stack.Screen name="UserSignup" component={UserSignupScreen} />
            <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
