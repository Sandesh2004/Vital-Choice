import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, FlatList, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../config';

const AdminDashboard = ({ setUserLoggedIn, setIsAdmin }) => {
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    try {
      const idToken = await AsyncStorage.getItem('authToken');
      const response = await axios.get(`${BASE_URL}/api/admin/profiles`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      setProfiles(response.data);
      setFilteredProfiles(response.data);
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
    } finally {
      setLoading(false); // ✅ stop loading
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('isAdmin');
    setUserLoggedIn(false);
    setIsAdmin(false);
  };

  const handleSearch = (text) => {
    setSearchTerm(text);
    setFilteredProfiles(profiles.filter(p => p.name.toLowerCase().includes(text.toLowerCase())));
  };

  const viewDetails = async (uid) => {
    const idToken = await AsyncStorage.getItem('authToken');
    const response = await axios.get(`${BASE_URL}/api/admin/profiles/${uid}`, {
      headers: { Authorization: `Bearer ${idToken}` }
    });
    setSelectedProfile(response.data);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      ) : (
        <>
          <TextInput
            placeholder="Search by name..."
            value={searchTerm}
            onChangeText={handleSearch}
            style={styles.search}
          />

          <FlatList
            data={filteredProfiles}
            keyExtractor={(item) => item.uid}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={styles.name}>{item.name}</Text>
                <Button title="View Details" onPress={() => viewDetails(item.uid)} />
              </View>
            )}
          />
        </>
      )}

      <Button title="Logout" onPress={handleLogout} />

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modal}>
          {selectedProfile && (
            <>
              <Text style={styles.title}>User Details</Text>
              <Text>Name: {selectedProfile.name}</Text>
              <Text>Age: {selectedProfile.age}</Text>
              <Text>Sex: {selectedProfile.sex}</Text>
              <Text>Phone: {selectedProfile.phone}</Text>
              <Text>Occupation: {selectedProfile.occupation}</Text>
              <Text>Nationality: {selectedProfile.nationality}</Text>
              <Button title="Close" onPress={() => setModalVisible(false)} />
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  search: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 15,
    borderRadius: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  name: { fontSize: 16 },
  modal: { flex: 1, padding: 20, justifyContent: 'center' },
});