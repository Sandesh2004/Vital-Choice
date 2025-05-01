import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, StatusBar, Platform } from 'react-native';

const RoleSelectionScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#3498DB" barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Vital Choice</Text>
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.heading}>Choose Your Role</Text>
          <Text style={styles.subheading}>Select how you want to access the application</Text>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('UserLogin')}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>Login as User</Text>
              <Text style={styles.buttonDescription}>For tobacco users seeking help</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.adminButton]}
            onPress={() => navigation.navigate('AdminLogin')}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>Login as Admin</Text>
              <Text style={styles.buttonDescription}>For healthcare providers</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Helping you make better choices</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RoleSelectionScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3498DB',
  },
  container: {
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
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  logo: {
    width: 40,
    height: 40,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 10,
    letterSpacing: 1,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3498DB',
    paddingVertical: 18,
    paddingHorizontal: 35,
    borderRadius: 15,
    marginVertical: 12,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  adminButton: {
    backgroundColor: '#2980B9',
  },
  buttonContent: {
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonDescription: {
    color: '#E0E0E0',
    fontSize: 14,
    marginTop: 5,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#7F8C8D',
    fontSize: 14,
    fontStyle: 'italic',
  }
});