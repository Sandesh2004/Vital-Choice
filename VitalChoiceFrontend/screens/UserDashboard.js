import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';


const UserDashboard = () => {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('isAdmin'); // ensure admin flag is cleared
      await signOut(auth); // this will trigger onAuthStateChanged
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Your Dashboard!</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default UserDashboard;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, marginBottom: 20 },
});
