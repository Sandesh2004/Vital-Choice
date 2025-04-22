import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../config';


const AdminLoginScreen = ({setIsAdmin }) => {
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const login = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (res.ok) {
        await AsyncStorage.setItem('isAdmin', 'true');
        Alert.alert('Success', 'Login successful ✅');
        setIsAdmin(true);
      } else {
        Alert.alert('Error', 'Wrong password ❌');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Server error');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>Admin Login</Text>

      <TextInput
        placeholder="Enter Admin Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          marginBottom: 10,
          borderRadius: 5,
        }}
      />

      <Button title="Login" onPress={login} />
    </View>
  );
};

export default AdminLoginScreen;
