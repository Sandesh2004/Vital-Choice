import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';

export default function SongListenerScreen() {
  const [selectedMood, setSelectedMood] = useState(null);

  const openLink = (url) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
  };

  const moods = ['Stressed', 'Sad', 'Hopeful', 'Motivated'];

  const resources = [
    {
      title: 'Motivational Song - Never Give Up',
      description: 'Encourages inner strength during tobacco withdrawal',
      url: 'https://www.youtube.com/watch?v=mgmVOuLgFB0',
      mood: 'Motivated',
    },
    {
      title: 'Calming Music for Cravings',
      description: 'Relax your mind and fight cravings',
      url: 'https://www.youtube.com/watch?v=1ZYbU82GVz4',
      mood: 'Stressed',
    },
    {
      title: 'Podcast: Mindfulness for Smokers',
      description: 'Mindfulness exercises to reduce urges',
      url: 'https://www.youtube.com/watch?v=YFSc7Ck0Ao0',
      mood: 'Stressed',
    },
    {
      title: 'Podcast: You Can Quit!',
      description: 'Stories from ex-smokers who succeeded',
      url: 'https://www.youtube.com/watch?v=n4nGpRYXp2o',
      mood: 'Hopeful',
    },
    {
      title: 'Music - Rise Above',
      description: 'Empowering music to keep going',
      url: 'https://www.youtube.com/watch?v=KxGRhd_iWuE',
      mood: 'Sad',
    },
  ];

  const filteredResources = selectedMood
    ? resources.filter((item) => item.mood === selectedMood)
    : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#3498DB" barStyle="light-content" />
      <ImageBackground
        source={require('../assets/music2.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <Text style={styles.headerTitle}>How are you feeling today?</Text>
          <View style={styles.moodButtonContainer}>
            {moods.map((mood) => (
              <TouchableOpacity
                key={mood}
                style={[
                  styles.moodButton,
                  selectedMood === mood && styles.moodButtonSelected,
                ]}
                onPress={() => setSelectedMood(mood)}
              >
                <Text
                  style={[
                    styles.moodButtonText,
                    selectedMood === mood && styles.moodButtonTextSelected,
                  ]}
                >
                  {mood}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {selectedMood ? (
              filteredResources.length > 0 ? (
                filteredResources.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.resourceButton}
                    onPress={() => openLink(item.url)}
                  >
                    <Text style={styles.resourceTitle}>{item.title}</Text>
                    <Text style={styles.resourceDescription}>{item.description}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noResultsText}>No media found for this mood.</Text>
              )
            ) : (
              <Text style={styles.instructionText}>
                Select your mood to get personalized recommendations.
              </Text>
            )}
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3498DB',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 20,
    textAlign: 'center',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  resourceButton: {
    backgroundColor: '#ffffffcc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#34495e',
  },
  moodButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 8,
  },
  moodButton: {
    backgroundColor: '#ffffff99',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    margin: 6,
  },
  moodButtonSelected: {
    backgroundColor: '#2ecc71',
  },
  moodButtonText: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  moodButtonTextSelected: {
    color: '#fff',
  },
  noResultsText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 30,
  },
  instructionText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    //marginTop: 5,
  },
});