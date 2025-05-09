import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import BreathingProgressTracker from '../components/BreathingProgressTracker';

const screenWidth = Dimensions.get('window').width;

export default function ProgressTrackerScreen() {
  return (
    <SafeAreaView style={styles.container}>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <BreathingProgressTracker />
        
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  placeholderCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    width: screenWidth - 30,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 22,
  },
});