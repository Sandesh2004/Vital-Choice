import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Modal, ActivityIndicator, TouchableOpacity, ScrollView, Image, Alert, SafeAreaView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../config';
import { Picker } from '@react-native-picker/picker';

const AdminDashboard = ({ setUserLoggedIn, setIsAdmin }) => {
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);

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
    setEditedProfile(response.data);
    setModalVisible(true);
    setEditMode(false);
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedProfile(selectedProfile);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const idToken = await AsyncStorage.getItem('authToken');
      await axios.put(`${BASE_URL}/api/admin/profiles/${editedProfile.uid}`, editedProfile, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      
      // Update the profiles list with the edited profile
      const updatedProfiles = profiles.map(p => 
        p.uid === editedProfile.uid ? editedProfile : p
      );
      setProfiles(updatedProfiles);
      setFilteredProfiles(updatedProfiles);
      setSelectedProfile(editedProfile);
      setEditMode(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#3498DB" barStyle="light-content" />
      
      <View style={styles.header}>
        <Image
          source={require('../assets/icon.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Vital Choice</Text>
      </View>
      
      <View style={styles.container}>
        <Text style={styles.dashboardTitle}>Admin Dashboard</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#3498DB" style={{ marginTop: 20 }} />
        ) : (
          <>
            <View style={styles.searchContainer}>
              <TextInput
                placeholder="Search by name..."
                value={searchTerm}
                onChangeText={handleSearch}
                style={styles.search}
                placeholderTextColor="#999"
              />
            </View>

            <FlatList
              data={filteredProfiles}
              keyExtractor={(item) => item.uid}
              renderItem={({ item }) => (
                <View style={styles.profileCard}>
                  <Text style={styles.name}>{item.name}</Text>
                  <TouchableOpacity style={styles.viewButton} onPress={() => viewDetails(item.uid)}>
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              )}
              contentContainerStyle={styles.listContainer}
            />
          </>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar backgroundColor="#3498DB" barStyle="light-content" />
          
          <View style={styles.header}>
            <Image
              source={require('../assets/icon.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>Vital Choice</Text>
          </View>
          
          <ScrollView contentContainerStyle={styles.modalContent}>
            {selectedProfile && (
              <>
                <Text style={styles.modalTitle}>User Details</Text>

                {!editMode ? (
                  // View Mode
                  <View style={styles.detailsContainer}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Name:</Text>
                      <Text style={styles.detailValue}>{selectedProfile.name}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Age:</Text>
                      <Text style={styles.detailValue}>{selectedProfile.age}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Sex:</Text>
                      <Text style={styles.detailValue}>{selectedProfile.sex}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Nationality:</Text>
                      <Text style={styles.detailValue}>{selectedProfile.nationality}</Text>
                    </View>
                    
                    {selectedProfile.nationality === 'India' && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Aadhar Number:</Text>
                        <Text style={styles.detailValue}>{selectedProfile.aadhar}</Text>
                      </View>
                    )}
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Address:</Text>
                      <Text style={styles.detailValue}>{selectedProfile.address}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Phone:</Text>
                      <Text style={styles.detailValue}>{selectedProfile.phone}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Email:</Text>
                      <Text style={styles.detailValue}>{selectedProfile.email}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Marital Status:</Text>
                      <Text style={styles.detailValue}>{selectedProfile.maritalStatus}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Occupation:</Text>
                      <Text style={styles.detailValue}>{selectedProfile.occupation}</Text>
                    </View>
                    
                    {selectedProfile.occupation === 'Other' && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Other Occupation:</Text>
                        <Text style={styles.detailValue}>{selectedProfile.occupationOther}</Text>
                      </View>
                    )}
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Income:</Text>
                      <Text style={styles.detailValue}>{selectedProfile.income}</Text>
                    </View>
                    
                    <Text style={styles.sectionTitle}>Tobacco Usage Information</Text>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Types of Tobacco Used:</Text>
                      <Text style={styles.detailValue}>{selectedProfile.tobaccoTypes?.join(', ')}</Text>
                    </View>
                    
                    {selectedProfile.tobaccoTypes?.includes('Other') && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Other Tobacco Type:</Text>
                        <Text style={styles.detailValue}>{selectedProfile.otherTobaccoType}</Text>
                      </View>
                    )}
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Frequency Per Day:</Text>
                      <Text style={styles.detailValue}>{selectedProfile.frequencyPerDay}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Usual Craving Timings:</Text>
                      <Text style={styles.detailValue}>{selectedProfile.cravingTimings?.join(', ')}</Text>
                    </View>
                    
                    {selectedProfile.cravingTimings?.includes('Other') && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Other Craving Timing:</Text>
                        <Text style={styles.detailValue}>{selectedProfile.otherCravingTiming}</Text>
                      </View>
                    )}
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Years Using Tobacco:</Text>
                      <Text style={styles.detailValue}>{selectedProfile.yearsUsing}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Reason for Quitting:</Text>
                      <Text style={styles.detailValue}>{selectedProfile.quittingReason}</Text>
                    </View>
                    
                    {selectedProfile.quittingReason === 'Other' && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Other Quitting Reason:</Text>
                        <Text style={styles.detailValue}>{selectedProfile.quittingReasonOther}</Text>
                      </View>
                    )}
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Confidence Level to Quit:</Text>
                      <Text style={styles.detailValue}>{selectedProfile.confidenceLevel}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Health Issues:</Text>
                      <Text style={styles.detailValue}>{selectedProfile.healthIssues?.join(', ')}</Text>
                    </View>
                    
                    {selectedProfile.healthIssues?.includes('Other') && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Other Health Issues:</Text>
                        <Text style={styles.detailValue}>{selectedProfile.healthIssuesOther}</Text>
                      </View>
                    )}
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Triggers:</Text>
                      <Text style={styles.detailValue}>{selectedProfile.triggers?.join(', ')}</Text>
                    </View>
                    
                    {selectedProfile.triggers?.includes('Other') && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Other Trigger:</Text>
                        <Text style={styles.detailValue}>{selectedProfile.otherTrigger}</Text>
                      </View>
                    )}
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Average Monthly Tobacco Spending (₹):</Text>
                      <Text style={styles.detailValue}>{selectedProfile.tobaccoSpending}</Text>
                    </View>
                    
                    <View style={styles.buttonRow}>
                      <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                        <Text style={styles.buttonText}>Edit Profile</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                        <Text style={styles.closeButtonText}>Close</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  // Edit Mode
                  <ScrollView>
                  <Text style={styles.sectionTitle}>Personal Information</Text>
                  
                  <Text style={styles.label}>Name</Text>
                  <TextInput 
                    style={styles.editInput}
                    value={editedProfile.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                  />

                  <Text style={styles.label}>Age</Text>
                  <TextInput 
                    style={styles.editInput}
                    value={editedProfile.age ? editedProfile.age.toString() : ''}
                    onChangeText={(value) => handleInputChange('age', value)}
                    keyboardType="numeric"
                  />

                  <Text style={styles.label}>Sex</Text>
                  <View style={styles.radioGroup}>
                    {['Male', 'Female', 'Other'].map(option => (
                      <TouchableOpacity 
                        key={option} 
                        onPress={() => handleInputChange('sex', option)}
                        style={styles.radioOption}
                      >
                        <Text style={styles.radioText}>
                          {editedProfile.sex === option ? '🔘' : '⚪'} {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.label}>Nationality</Text>
                  <Picker
                    selectedValue={editedProfile.nationality}
                    onValueChange={(value) => handleInputChange('nationality', value)}
                    style={styles.picker}
                  >
                    {["India", "United States", "Canada", "Australia", "Germany"].map(c => 
                      <Picker.Item key={c} label={c} value={c} />
                    )}
                  </Picker>

                  {editedProfile.nationality === 'India' && (
                    <>
                      <Text style={styles.label}>Aadhar Number</Text>
                      <TextInput 
                        style={styles.editInput}
                        value={editedProfile.aadhar}
                        onChangeText={(value) => handleInputChange('aadhar', value)}
                        keyboardType="numeric"
                      />
                    </>
                  )}

                  <Text style={styles.label}>Address</Text>
                  <TextInput 
                    style={styles.editInput}
                    value={editedProfile.address}
                    onChangeText={(value) => handleInputChange('address', value)}
                    multiline
                  />

                  <Text style={styles.label}>Phone</Text>
                  <TextInput 
                    style={styles.editInput}
                    value={editedProfile.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    keyboardType="phone-pad"
                  />

                  <Text style={styles.label}>Email</Text>
                  <TextInput 
                    style={styles.editInput}
                    value={editedProfile.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                  />

                  <Text style={styles.label}>Marital Status</Text>
                  <Picker
                    selectedValue={editedProfile.maritalStatus}
                    onValueChange={(value) => handleInputChange('maritalStatus', value)}
                    style={styles.picker}
                  >
                    {["Unmarried", "Married", "Widowed", "Separated or divorced", "Not applicable"].map(option => 
                      <Picker.Item key={option} label={option} value={option} />
                    )}
                  </Picker>

                  <Text style={styles.label}>Occupation</Text>
                  <Picker
                    selectedValue={editedProfile.occupation}
                    onValueChange={(value) => handleInputChange('occupation', value)}
                    style={styles.picker}
                  >
                    {["Professional or Semi-professional", "Skilled, semi-skilled or unskilled worker", "Retired", "Housewife", "Student", "Other", "Unemployed"].map(option => 
                      <Picker.Item key={option} label={option} value={option} />
                    )}
                  </Picker>
                  
                  {editedProfile.occupation === 'Other' && (
                    <>
                      <Text style={styles.label}>Other Occupation</Text>
                      <TextInput 
                        style={styles.editInput}
                        value={editedProfile.occupationOther}
                        onChangeText={(value) => handleInputChange('occupationOther', value)}
                      />
                    </>
                  )}

                  <Text style={styles.label}>Income</Text>
                  <TextInput 
                    style={styles.editInput}
                    value={editedProfile.income ? editedProfile.income.toString() : ''}
                    onChangeText={(value) => handleInputChange('income', value)}
                    keyboardType="numeric"
                  />

                  <Text style={styles.sectionTitle}>Tobacco Usage Information</Text>

                  <Text style={styles.label}>Types of Tobacco Used</Text>
                  <View style={styles.checkboxGroup}>
                    {['Chewing tobacco', 'Gutka', 'Khaini', 'Paan', 'Mawa', 'Misri', 'Gul', 'Other'].map(option => (
                      <TouchableOpacity 
                        key={option} 
                        onPress={() => {
                          const selected = editedProfile.tobaccoTypes?.includes(option)
                            ? editedProfile.tobaccoTypes.filter(item => item !== option)
                            : [...(editedProfile.tobaccoTypes || []), option];
                          handleInputChange('tobaccoTypes', selected);
                        }}
                        style={styles.checkboxOption}
                      >
                        <Text style={styles.checkboxText}>
                          {editedProfile.tobaccoTypes?.includes(option) ? '☑️' : '⬜️'} {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  {editedProfile.tobaccoTypes?.includes('Other') && (
                    <>
                      <Text style={styles.label}>Other Tobacco Type</Text>
                      <TextInput 
                        style={styles.editInput}
                        value={editedProfile.otherTobaccoType}
                        onChangeText={(value) => handleInputChange('otherTobaccoType', value)}
                      />
                    </>
                  )}

                  <Text style={styles.label}>Frequency Per Day</Text>
                  <TextInput 
                    style={styles.editInput}
                    value={editedProfile.frequencyPerDay ? editedProfile.frequencyPerDay.toString() : ''}
                    onChangeText={(value) => handleInputChange('frequencyPerDay', value)}
                    keyboardType="numeric"
                  />

                  <Text style={styles.label}>Usual Craving Timings</Text>
                  <View style={styles.checkboxGroup}>
                    {['Morning', 'After Meals', 'While Working', 'Before Sleep', 'Other'].map(option => (
                      <TouchableOpacity 
                        key={option} 
                        onPress={() => {
                          const selected = editedProfile.cravingTimings?.includes(option)
                            ? editedProfile.cravingTimings.filter(item => item !== option)
                            : [...(editedProfile.cravingTimings || []), option];
                          handleInputChange('cravingTimings', selected);
                        }}
                        style={styles.checkboxOption}
                      >
                        <Text style={styles.checkboxText}>
                          {editedProfile.cravingTimings?.includes(option) ? '☑️' : '⬜️'} {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  {editedProfile.cravingTimings?.includes('Other') && (
                    <>
                      <Text style={styles.label}>Other Craving Timing</Text>
                      <TextInput 
                        style={styles.editInput}
                        value={editedProfile.otherCravingTiming}
                        onChangeText={(value) => handleInputChange('otherCravingTiming', value)}
                      />
                    </>
                  )}

                  <Text style={styles.label}>Years Using Tobacco</Text>
                  <TextInput 
                    style={styles.editInput}
                    value={editedProfile.yearsUsing ? editedProfile.yearsUsing.toString() : ''}
                    onChangeText={(value) => handleInputChange('yearsUsing', value)}
                    keyboardType="numeric"
                  />

                  <Text style={styles.label}>Reason for Quitting</Text>
                  <Picker
                    selectedValue={editedProfile.quittingReason}
                    onValueChange={(value) => handleInputChange('quittingReason', value)}
                    style={styles.picker}
                  >
                    {["Health concerns", "Family pressure", "Financial reasons", "Social stigma", "Other"].map(option => 
                      <Picker.Item key={option} label={option} value={option} />
                    )}
                  </Picker>
                  
                  {editedProfile.quittingReason === 'Other' && (
                    <>
                      <Text style={styles.label}>Other Quitting Reason</Text>
                      <TextInput 
                        style={styles.editInput}
                        value={editedProfile.quittingReasonOther}
                        onChangeText={(value) => handleInputChange('quittingReasonOther', value)}
                      />
                    </>
                  )}

                  <Text style={styles.label}>Confidence Level to Quit</Text>
                  <Picker
                    selectedValue={editedProfile.confidenceLevel}
                    onValueChange={(value) => handleInputChange('confidenceLevel', value)}
                    style={styles.picker}
                  >
                    {["Very Low", "Low", "Moderate", "High", "Very High"].map(option => 
                      <Picker.Item key={option} label={option} value={option} />
                    )}
                  </Picker>

                  <Text style={styles.label}>Health Issues</Text>
                  <View style={styles.checkboxGroup}>
                    {['Oral cancer', 'Lung disease', 'Heart disease', 'Dental problems', 'Digestive issues', 'Other'].map(option => (
                      <TouchableOpacity 
                        key={option} 
                        onPress={() => {
                          const selected = editedProfile.healthIssues?.includes(option)
                            ? editedProfile.healthIssues.filter(item => item !== option)
                            : [...(editedProfile.healthIssues || []), option];
                          handleInputChange('healthIssues', selected);
                        }}
                        style={styles.checkboxOption}
                      >
                        <Text style={styles.checkboxText}>
                          {editedProfile.healthIssues?.includes(option) ? '☑️' : '⬜️'} {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  {editedProfile.healthIssues?.includes('Other') && (
                    <>
                      <Text style={styles.label}>Other Health Issues</Text>
                      <TextInput 
                        style={styles.editInput}
                        value={editedProfile.healthIssuesOther}
                        onChangeText={(value) => handleInputChange('healthIssuesOther', value)}
                      />
                    </>
                  )}

                  <Text style={styles.label}>Triggers</Text>
                  <View style={styles.checkboxGroup}>
                    {['Stress', 'Social gatherings', 'After meals', 'Alcohol consumption', 'Boredom', 'Other'].map(option => (
                      <TouchableOpacity 
                        key={option} 
                        onPress={() => {
                          const selected = editedProfile.triggers?.includes(option)
                            ? editedProfile.triggers.filter(item => item !== option)
                            : [...(editedProfile.triggers || []), option];
                          handleInputChange('triggers', selected);
                        }}
                        style={styles.checkboxOption}
                      >
                        <Text style={styles.checkboxText}>
                          {editedProfile.triggers?.includes(option) ? '☑️' : '⬜️'} {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  {editedProfile.triggers?.includes('Other') && (
                    <>
                      <Text style={styles.label}>Other Trigger</Text>
                      <TextInput 
                        style={styles.editInput}
                        value={editedProfile.otherTrigger}
                        onChangeText={(value) => handleInputChange('otherTrigger', value)}
                      />
                    </>
                  )}

                  <Text style={styles.label}>Average Monthly Tobacco Spending (₹)</Text>
                  <TextInput 
                    style={styles.editInput}
                    value={editedProfile.tobaccoSpending ? editedProfile.tobaccoSpending.toString() : ''}
                    onChangeText={(value) => handleInputChange('tobaccoSpending', value)}
                    keyboardType="numeric"
                  />

                  <View style={styles.buttonRow}>
                    <TouchableOpacity 
                      style={styles.saveButton} 
                      onPress={handleSave}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.buttonText}>Save Changes</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.cancelButton} 
                      onPress={handleCancel}
                      disabled={loading}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              )}
            </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498DB',
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  headerLogo: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: 15,
  },
  search: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listContainer: {
    paddingBottom: 80,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  viewButton: {
    backgroundColor: '#3498DB',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  logoutButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3498DB',
    marginTop: 15,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  detailValue: {
    flex: 2,
    fontSize: 16,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  editButton: {
    backgroundColor: '#3498DB',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Existing edit mode styles
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  radioGroup: {
    marginBottom: 15,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioText: {
    fontSize: 16,
    marginLeft: 8,
  },
  picker: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
  },
  checkboxGroup: {
    marginBottom: 15,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxText: {
    fontSize: 16,
    marginLeft: 8,
  },
});