import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';



const UserLoginScreen = ({ navigation, setUserLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/user/login`, {
        email,
        password,
      });

      await AsyncStorage.setItem('authToken', response.data.idToken);
      Alert.alert('Success', 'Logged in successfully!');
      setUserLoggedIn(true);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Invalid Credentials');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>User Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.switchPage}
        onPress={() => navigation.navigate('UserSignup')}>
        <Text style={styles.switchText}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UserLoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: { fontSize: 24, marginBottom: 20 },
  input: {
    width: '80%', padding: 15, borderWidth: 1,
    borderColor: '#ccc', borderRadius: 10, marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF', padding: 15, borderRadius: 10,
  },
  buttonText: { color: '#fff', fontSize: 18 },
  switchPage: { marginTop: 20 },
  switchText: { color: '#007AFF' },
});
