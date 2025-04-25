import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileForm from './ProfileForm';
import { BASE_URL } from '../config';
import axios from 'axios';


const UserDashboard = ({ setUserLoggedIn, setIsAdmin }) => {
  const [profileCreated, setProfileCreated] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const idToken = await AsyncStorage.getItem('authToken');
  
        const response = await fetch(`${BASE_URL}/api/user/profile`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
  
        const result = await response.json();
  
        if (response.ok) {
          setProfileData(result);
          setProfileCreated(true);
        } else if (response.status === 404) {
          console.log("No profile found. Prompting to create profile.");
        } else {
          Alert.alert('Error', result.message || 'Unable to fetch profile');
        }
      } catch (error) {
        console.error('Fetch profile error:', error);
        Alert.alert('Error', 'Something went wrong while fetching profile');
      } finally {
        setLoading(false); // Turn off loading
      }
    };
  
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('isAdmin');
      setUserLoggedIn(false);
      setIsAdmin(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };


  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ): !profileCreated ? (
        <ProfileForm onSubmit={data => {
          setProfileData(data);
          setProfileCreated(true);
        }} />
      ) : (
        <>
          <Text style={styles.title}>Your Profile</Text>
          <Text>Name: {profileData.name}</Text>
          <Text>Age: {profileData.age}</Text>
          {/* Add other profile fields below as needed */}
          <Text>Phone: {profileData.phone}</Text>
          <Text>Sex: {profileData.sex}</Text>
          <Text>Nationality: {profileData.nationality}</Text>
          <Text>Occupation: {profileData.occupation}</Text>
          <Button title="Logout" onPress={handleLogout} />
        </>
      )}
    </View>
  );
};

export default UserDashboard;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
});
