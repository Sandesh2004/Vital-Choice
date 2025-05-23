import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, SafeAreaView, StatusBar, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileForm from './ProfileForm';
import { BASE_URL } from '../config';
import axios from 'axios';
import { useLanguage } from '../center_for_languages';

const UserDashboard = ({ setUserLoggedIn, setIsAdmin }) => {
  const [profileCreated, setProfileCreated] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  // Get translations
  const { t } = useLanguage();

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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#3498DB" barStyle="light-content" />
        <View style={styles.container}>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3498DB" />
              <Text style={styles.loadingText}>{t('loadingProfile')}</Text>
            </View>
          ) : !profileCreated ? (
            <ProfileForm onSubmit={data => {
              setProfileData(data);
              setProfileCreated(true);
            }} />
          ) : (
            <ScrollView contentContainerStyle={styles.profileContainer}>
              <View style={styles.profileHeader}>
                <Text style={styles.subtitle}>{t('personalInformation')}</Text>
              </View>

              <View style={styles.infoSection}>
                {/* Part A */}
                {profileData.name ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('name')}:</Text>
                    <Text style={styles.infoValue}>{profileData.name}</Text>
                  </View>
                ) : null}
                
                {profileData.age ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('age')}:</Text>
                    <Text style={styles.infoValue}>{profileData.age}</Text>
                  </View>
                ) : null}
                
                {profileData.sex ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('sex')}:</Text>
                    <Text style={styles.infoValue}>{profileData.sex}</Text>
                  </View>
                ) : null}
                
                {profileData.nationality ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('nationality')}:</Text>
                    <Text style={styles.infoValue}>{profileData.nationality}</Text>
                  </View>
                ) : null}
                
                {profileData.aadhar ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('aadhar')}:</Text>
                    <Text style={styles.infoValue}>{profileData.aadhar}</Text>
                  </View>
                ) : null}
                
                {profileData.address ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('address')}:</Text>
                    <Text style={styles.infoValue}>{profileData.address}</Text>
                  </View>
                ) : null}
                
                {profileData.phone ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('phone')}:</Text>
                    <Text style={styles.infoValue}>{profileData.phone}</Text>
                  </View>
                ) : null}
                
                {profileData.email ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('email')}:</Text>
                    <Text style={styles.infoValue}>{profileData.email}</Text>
                  </View>
                ) : null}
                
                {profileData.maritalStatus ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('maritalStatus')}:</Text>
                    <Text style={styles.infoValue}>{profileData.maritalStatus}</Text>
                  </View>
                ) : null}
                
                {profileData.occupation ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('occupation')}:</Text>
                    <Text style={styles.infoValue}>{profileData.occupation}</Text>
                  </View>
                ) : null}
                
                {profileData.occupationOther ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('occupationOther')}:</Text>
                    <Text style={styles.infoValue}>{profileData.occupationOther}</Text>
                  </View>
                ) : null}
                
                {profileData.income ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('income')}:</Text>
                    <Text style={styles.infoValue}>{profileData.income}</Text>
                  </View>
                ) : null}
              </View>

              {/* Part B */}
              
              <View style={styles.profileHeader}>
                <Text style={styles.subtitle}>{t('tobaccoUsageDetails')}</Text>
              </View>
              <View style={styles.tobaccoSection}>  
                {profileData.tobaccoTypes?.length > 0 ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('tobaccoTypes')}:</Text>
                    <Text style={styles.infoValue}>{profileData.tobaccoTypes.join(', ')}</Text>
                  </View>
                ) : null}
                
                {profileData.otherTobaccoType ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('otherTobaccoType')}:</Text>
                    <Text style={styles.infoValue}>{profileData.otherTobaccoType}</Text>
                  </View>
                ) : null}
                
                {profileData.frequencyPerDay ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('frequencyPerDay')}:</Text>
                    <Text style={styles.infoValue}>{profileData.frequencyPerDay}</Text>
                  </View>
                ) : null}
                
                {profileData.cravingTimings?.length > 0 ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('cravingTimings')}:</Text>
                    <Text style={styles.infoValue}>{profileData.cravingTimings.join(', ')}</Text>
                  </View>
                ) : null}
                
                {profileData.otherCravingTiming ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('otherCravingTiming')}:</Text>
                    <Text style={styles.infoValue}>{profileData.otherCravingTiming}</Text>
                  </View>
                ) : null}
                
                {profileData.yearsUsing ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('yearsUsing')}:</Text>
                    <Text style={styles.infoValue}>{profileData.yearsUsing}</Text>
                  </View>
                ) : null}
                
                {profileData.quittingReason ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('quittingReason')}:</Text>
                    <Text style={styles.infoValue}>
                      {Array.isArray(profileData.quittingReason) 
                        ? profileData.quittingReason.join(', ') 
                        : profileData.quittingReason}
                    </Text>
                  </View>
                ) : null}
                
                {profileData.quittingReasonOther ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('quittingReasonOther')}:</Text>
                    <Text style={styles.infoValue}>{profileData.quittingReasonOther}</Text>
                  </View>
                ) : null}
                
                {profileData.confidenceLevel ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('confidenceLevel')}:</Text>
                    <Text style={styles.infoValue}>{profileData.confidenceLevel}</Text>
                  </View>
                ) : null}
                
                {profileData.healthIssues?.length > 0 ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('healthIssues')}:</Text>
                    <Text style={styles.infoValue}>{profileData.healthIssues.join(', ')}</Text>
                  </View>
                ) : null}
                
                {profileData.healthIssuesOther ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('healthIssuesOther')}:</Text>
                    <Text style={styles.infoValue}>{profileData.healthIssuesOther}</Text>
                  </View>
                ) : null}
                
                {profileData.triggers?.length > 0 ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('triggers')}:</Text>
                    <Text style={styles.infoValue}>{profileData.triggers.join(', ')}</Text>
                  </View>
                ) : null}
                
                {profileData.otherTrigger ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('otherTrigger')}:</Text>
                    <Text style={styles.infoValue}>{profileData.otherTrigger}</Text>
                  </View>
                ) : null}
                
                {profileData.tobaccoSpending ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('tobaccoSpending')}:</Text>
                    <Text style={styles.infoValue}>₹{profileData.tobaccoSpending}</Text>
                  </View>
                ) : null}
              </View>

              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>{t('logout')}</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
    </SafeAreaView>
  );    
};

export default UserDashboard;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3498DB', // Match your header color
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  logo: {
    width: 40,
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#7F8C8D',
  },
  profileContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#3498DB',
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3498DB',
    marginTop: 10,
    marginBottom: 15,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tobaccoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
    paddingVertical: 10,
  },
  infoLabel: {
    flex: 0.4,
    fontSize: 16,
    fontWeight: '600',
    color: '#34495E',
  },
  infoValue: {
    flex: 0.6,
    fontSize: 16,
    color: '#2C3E50',
  },
  logoutButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
});