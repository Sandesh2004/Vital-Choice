import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MotivationScreen from './MotivationScreen';
import BreatherScreen from './BreatherScreen';
import SongListenerScreen from './SongListenerScreen';
import ProgressTrackerScreen from './ProgressTrackerScreen';
import UserDashboard from './UserDashboard';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';

const Tab = createBottomTabNavigator();

export default function UserHomeScreen({ setUserLoggedIn, setIsAdmin }) {
  return (
    <View style={{ flex: 1 }}>
      <AppHeader title="Vital Choice" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Motivation') iconName = 'star';
            else if (route.name === 'Breather') iconName = 'leaf';
            else if (route.name === 'Songs') iconName = 'musical-notes';
            else if (route.name === 'Progress') iconName = 'stats-chart';
            else if (route.name === 'Profile') iconName = 'person';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          headerShown: false, // Hide the default header
        })}
      >
        <Tab.Screen name="Motivation" component={MotivationScreen} />
        <Tab.Screen name="Breather" component={BreatherScreen} />
        <Tab.Screen name="Songs" component={SongListenerScreen} />
        <Tab.Screen name="Progress" component={ProgressTrackerScreen} />
        <Tab.Screen name="Profile">
          {props => <UserDashboard {...props} setUserLoggedIn={setUserLoggedIn} setIsAdmin={setIsAdmin} />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}