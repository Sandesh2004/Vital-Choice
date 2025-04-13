import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RoleSelectionScreen from './screens/RoleSelectionScreen';
import UserLoginScreen from './screens/UserLoginScreen';
import UserSignupScreen from './screens/UserSignupScreen';
import AdminLoginScreen from './screens/AdminLoginScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="RoleSelection">
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} options={{ title: "Welcome" }} />
        <Stack.Screen name="UserLogin" component={UserLoginScreen} />
        <Stack.Screen name="UserSignup" component={UserSignupScreen} />
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
