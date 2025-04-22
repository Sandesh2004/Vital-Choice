import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileForm from './ProfileForm';

const UserDashboard = ({ setUserLoggedIn, setIsAdmin }) => {
  const [profileCreated, setProfileCreated] = useState(false);
  const [profileData, setProfileData] = useState(null);

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

  useEffect(() => {
    const fetchProfile = async () => {
      const storedProfile = await AsyncStorage.getItem('profile');
      if (storedProfile) {
        setProfileData(JSON.parse(storedProfile));
        setProfileCreated(true);
      }
    };
    fetchProfile();
  }, []);

  return (
    <View style={styles.container}>
      {!profileCreated ? (
        <ProfileForm onSubmit={data => {
          setProfileData(data);
          setProfileCreated(true);
        }} />
      ) : (
        <>
          <Text style={styles.title}>Your Profile</Text>
          <Text>Name: {profileData.name}</Text>
          <Text>Age: {profileData.age}</Text>
          {/* Add other profile fields here */}
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
